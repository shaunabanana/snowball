<template>
<div>
    <a-button type="text" @click="store.activePaper = null">
        <template #icon>
            <IconClose />
        </template>
        <!-- Use the default slot to avoid extra spaces -->
        <template #default>Close</template>
    </a-button>
    <a-descriptions
        v-if="store.currentPaper"
        size="medium"
        layout="vertical"
        style="padding: 0.5rem; padding-left: 1rem"
        :column="1"
    >
        <template #title>
            <span ref="title">{{store.currentPaper.title}}</span>
        </template>
        <a-descriptions-item>
            <TagEditor />
        </a-descriptions-item>

        <a-descriptions-item label="Authors">
            {{
                store.currentPaper.authors
                    .map((author) => `${author.given} ${author.family}`)
                    .join(", ")
            }}
        </a-descriptions-item>

        <a-descriptions-item label="Abstract">
            <span v-if="store.currentPaper.abstract && !editingAbstract">
                <span ref="abstract">{{store.currentPaper.abstract}}</span>
                <a-button size="mini" type="text" @click="editAbstract">
                    Edit
                </a-button>
            </span>
            <a-textarea v-else auto-size ref="abstract"
                placeholder="Manually enter paper abstract here."
                v-model="store.currentPaper.abstract"
                @focus="editingAbstract = true"
                @blur="editingAbstract = false"
                @change="updateAbstract($event)"
            />
        </a-descriptions-item>

        <a-descriptions-item label="Keywords"
            v-if="store.currentPaper.keywords.length > 0"
        >
            <span ref="keywords">{{store.currentPaper.keywords.join(', ')}}</span>
        </a-descriptions-item>

        <a-descriptions-item label="DOI">
            <span v-if="store.currentPaper.doi && !editingDOI">
                {{store.currentPaper.doi}}
                <a-button size="mini" type="text" @click="editDOI">
                    Edit
                </a-button>
            </span>
            <a-textarea v-else auto-size ref="doi"
                placeholder="Manually enter paper DOI here."
                v-model="store.currentPaper.doi"
                @focus="editingDOI = true"
                @blur="editingDOI = false"
                @change="updateDOI($event)"
            />
        </a-descriptions-item>

        <a-descriptions-item label="Paper Links" v-if="store.currentPaper.doi">
            <a-space>
                <a-button size="small"
                    @click="openLink(store.currentPaper.doi, 'scihub')"
                >
                    Sci-Hub
                </a-button>
                <a-button size="small"
                    @click="openLink(store.currentPaper.doi, 'doi')"
                >
                    DOI.org
                </a-button>
            </a-space>
        </a-descriptions-item>

        <a-descriptions-item label="Year">
            {{store.currentPaper.year}}
        </a-descriptions-item>

        <a-descriptions-item label="Container Title"
            v-if="store.currentPaper.record['container-title']"
        >
            {{store.currentPaper.record['container-title']}}
        </a-descriptions-item>

        <a-descriptions-item label="Collection Title"
            v-if="store.currentPaper.record['collection-title']"
        >
            {{store.currentPaper.record['collection-title']}}
        </a-descriptions-item>

        <a-descriptions-item label="Venue"
            v-if="store.currentPaper.record['venue']"
        >
            {{store.currentPaper.record['venue']}}
        </a-descriptions-item>

        <a-descriptions-item label="Journal"
            v-if="store.currentPaper.record['journal'] &&
                store.currentPaper.record['journal'].name"
        >
            {{store.currentPaper.record['journal'].name}}
        </a-descriptions-item>

        <a-descriptions-item label="Comments">
            <PaperComments
                :comments="store.currentPaper.comments"
                @update="store.edit(store.activeSheet, store.activePaper, {comments: $event})"
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
import PaperComments from '@/components/comments/PaperComments.vue';

import { match } from '@/utils/search';
import useSnowballStore from '@/store';

export default {
    name: 'PaperDetails',
    components: {
        TagEditor,
        PaperComments,
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

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
            this.store.edit(
                this.store.activeSheet,
                this.store.activePaper,
                { notes: value },
            );
            this.editingAbstract = false;
        },

        updateDOI(value) {
            this.store.edit(
                this.store.activeSheet,
                this.store.activePaper,
                { doi: value },
            );
            this.editingDOI = false;
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
                if (this.store.filterMethod.toLowerCase() === 'boolean') {
                    const fieldData = preprocess
                        ? preprocess(this.store.currentPaper[field])
                        : this.store.currentPaper[field];

                    console.log(`[PaperDetails][highlightField] Field data is "${fieldData}".`);
                    const matches = match(
                        this.store.filterMethod,
                        fieldData,
                        this.store.filter,
                    );

                    console.log(`[PaperDetails][highlightField] Matches: "${JSON.stringify(matches)}".`);
                    nextTick(() => {
                        mark.markRanges(matches);
                    });
                } else if (this.store.filterMethod.toLowerCase() === 'regexp') {
                    nextTick(() => {
                        mark.markRegExp(new RegExp(this.store.filter));
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
        'store.activePaper': function () {
            if (!this.store.activePaper) return;
            console.log('[PaperDetails][Watch] Active paper changed. Re-highlighting.');
            this.highlight();
        },

        // eslint-disable-next-line func-names
        'store.filter': function () {
            if (!this.store.filter || this.store.filter.length === 0) return;
            console.log('[PaperDetails][Watch] Filter changed. Re-highlighting.');
            this.highlight();
        },

        // eslint-disable-next-line func-names
        'store.filterMethod': function () {
            if (!this.store.filter || this.store.filter.length === 0) return;
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
