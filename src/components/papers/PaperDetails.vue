<template>
<div>
    <a-button type="text" @click="$store.commit('setActivePaper', null)">
        <template #icon>
            <IconClose />
        </template>
        <!-- Use the default slot to avoid extra spaces -->
        <template #default>Close</template>
    </a-button>
    <a-descriptions
        v-if="$store.state.activePaper"
        size="medium"
        layout="vertical"
        style="padding: 0.5rem; padding-left: 1rem"
        :column="1"
    >
        <template #title>
            <span ref="title">{{$store.state.activePaper.title}}</span>
        </template>
        <a-descriptions-item>
            <TagEditor />
        </a-descriptions-item>

        <a-descriptions-item label="Authors">
            {{
                $store.state.activePaper.authors
                    .map((author) => `${author.given} ${author.family}`)
                    .join(", ")
            }}
        </a-descriptions-item>

        <a-descriptions-item label="Abstract">
            <span v-if="$store.state.activePaper.abstract && !editingAbstract">
                <span ref="abstract">{{$store.state.activePaper.abstract}}</span>
                <a-button size="mini" type="text" @click="editAbstract">
                    Edit
                </a-button>
            </span>
            <a-textarea v-else auto-size ref="abstract"
                placeholder="Manually enter paper abstract here."
                v-model="$store.state.activePaper.abstract"
                @focus="editingAbstract = true"
                @blur="editingAbstract = false"
                @change="updateAbstract($event)"
            />
        </a-descriptions-item>

        <a-descriptions-item label="Keywords"
            v-if="$store.state.activePaper.keywords.length > 0"
        >
            <span ref="keywords">{{$store.state.activePaper.keywords.join(', ')}}</span>
        </a-descriptions-item>

        <a-descriptions-item label="DOI">
            <span v-if="$store.state.activePaper.doi && !editingDOI">
                {{$store.state.activePaper.doi}}
                <a-button size="mini" type="text" @click="editDOI">
                    Edit
                </a-button>
            </span>
            <a-textarea v-else auto-size ref="doi"
                placeholder="Manually enter paper DOI here."
                v-model="$store.state.activePaper.doi"
                @focus="editingDOI = true"
                @blur="editingDOI = false"
                @change="updateDOI($event)"
            />
        </a-descriptions-item>

        <a-descriptions-item label="Paper Links" v-if="$store.state.activePaper.doi">
            <a-space>
                <a-button size="small"
                    @click="openLink($store.state.activePaper.doi, 'scihub')"
                >
                    Sci-Hub
                </a-button>
                <a-button size="small"
                    @click="openLink($store.state.activePaper.doi, 'doi')"
                >
                    DOI.org
                </a-button>
            </a-space>
        </a-descriptions-item>

        <a-descriptions-item label="Year">
            {{$store.state.activePaper.year}}
        </a-descriptions-item>

        <a-descriptions-item label="Container Title"
            v-if="$store.state.activePaper.record['container-title']"
        >
            {{$store.state.activePaper.record['container-title']}}
        </a-descriptions-item>

        <a-descriptions-item label="Collection Title"
            v-if="$store.state.activePaper.record['collection-title']"
        >
            {{$store.state.activePaper.record['collection-title']}}
        </a-descriptions-item>

        <a-descriptions-item label="Venue"
            v-if="$store.state.activePaper.record['venue']"
        >
            {{$store.state.activePaper.record['venue']}}
        </a-descriptions-item>

        <a-descriptions-item label="Journal"
            v-if="$store.state.activePaper.record['journal'] &&
                $store.state.activePaper.record['journal'].name"
        >
            {{$store.state.activePaper.record['journal'].name}}
        </a-descriptions-item>

        <a-descriptions-item label="Notes">
            <a-textarea :auto-size="{minRows: 4}"
                placeholder="What are your thoughts?"
                v-model="$store.state.activePaper.notes"
                @change="$store.commit('updatePaper', {
                    paper: $store.state.activePaper.id,
                    updates: { notes: $event },
                })"
            />
        </a-descriptions-item>
    </a-descriptions>
</div>
</template>

<script>
import { nextTick } from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import Mark from 'mark.js';
import TagEditor from '@/components/tags/TagEditor.vue';

import { match } from '@/utils/search';

export default {
    name: 'PaperDetails',
    components: {
        TagEditor,
    },

    data() {
        return {
            editingAbstract: false,
            editingDOI: false,
        };
    },

    methods: {
        editAbstract() {
            this.editingAbstract = true;
            nextTick(() => {
                this.$refs.abstract.focus();
            });
        },

        editDOI() {
            this.editingDOI = true;
            nextTick(() => {
                this.$refs.doi.focus();
            });
        },

        updateAbstract(value) {
            this.$store.commit('updatePaper', {
                paper: this.$store.state.activePaper.id,
                updates: {
                    abstract: value,
                },
            });
            this.editingAbstract = false;
        },

        updateDOI(value) {
            this.$store.commit('updatePaper', {
                paper: this.$store.state.activePaper.id,
                updates: {
                    doi: value,
                },
            });
            this.editingAbstract = false;
        },

        openLink(doi, type) {
            if (type === 'scihub') {
                ipcRenderer.send('open-link', `https://sci-hub.se/${doi}`);
            }
            if (type === 'doi') {
                ipcRenderer.send('open-link', `https://doi.org/${doi}`);
            }
            return '';
        },

        highlightField(field, preprocess) {
            try {
                console.log(`[PaperDetails][highlightField] Highlighting ${field}`);
                const mark = new Mark(this.$refs[field]);
                console.log(`[PaperDetails][highlightField] Element is ${this.$refs[field]}`);
                mark.unmark();
                if (this.$store.state.filterMethod.toLowerCase() === 'boolean') {
                    const fieldData = preprocess
                        ? preprocess(this.$store.state.activePaper[field])
                        : this.$store.state.activePaper[field];

                    console.log(`[PaperDetails][highlightField] Field data is "${fieldData}".`);
                    const matches = match(
                        this.$store.state.filterMethod,
                        fieldData,
                        this.$store.state.filter,
                    );

                    console.log(`[PaperDetails][highlightField] Matches: "${JSON.stringify(matches)}".`);
                    nextTick(() => {
                        mark.markRanges(matches);
                    });
                } else if (this.$store.state.filterMethod.toLowerCase() === 'regexp') {
                    nextTick(() => {
                        mark.markRegExp(new RegExp(this.$store.state.filter));
                    });
                }
            } catch {
                console.log('Error highlighting. Abort.');
            }
        },

        highlight() {
            this.highlightField('title');
            this.highlightField('abstract');
            this.highlightField('keywords', (keywords) => keywords.join(', '));
        },
    },

    watch: {
        // eslint-disable-next-line func-names
        '$store.state.activePaper': function () {
            if (!this.$store.state.activePaper) return;
            console.log('[PaperDetails][Watch] Active paper changed. Re-highlighting.');
            this.highlight();
        },

        // eslint-disable-next-line func-names
        '$store.state.filter': function () {
            if (!this.$store.state.filter || this.$store.state.filter.length === 0) return;
            console.log('[PaperDetails][Watch] Filter changed. Re-highlighting.');
            this.highlight();
        },

        // eslint-disable-next-line func-names
        '$store.state.filterMethod': function () {
            if (!this.$store.state.filter || this.$store.state.filter.length === 0) return;
            console.log('[PaperDetails][Watch] Filter method changed. Re-highlighting.');
            this.highlight();
        },
    },
};
</script>

<style>
/* mark {
    background: var(--color-warning);
} */
</style>
