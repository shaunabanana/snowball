<template>
    <div>
        <el-row>
            <el-page-header
                title=" "
                icon="Close"
                style="padding: 1rem; vertical-align: center"
                @click="$emit('closePanel')"
            />
        </el-row>
        <el-row
            v-if="currentPaper"
            style="overflow-y: auto"
            :style="{ height: `${height}px` }"
        >
            <el-descriptions
                :title="currentPaper.title"
                :column="1"
                direction="vertical"
                style="padding: 1rem; padding-bottom: 20rem"
            >
                <el-descriptions-item>
                    <tag-editor
                        :tags="currentPaper.tags"
                        :paper-id="currentPaper.id"
                    />
                </el-descriptions-item>

                <el-descriptions-item label="Authors">
                    {{
                        currentPaper.authors
                            .map((author) => `${author.given} ${author.family}`)
                            .join(", ")
                    }}
                </el-descriptions-item>

                <el-descriptions-item label="Abstract">
                    <span
                        v-if="!editing"
                        @click="
                            editing = true;
                            $nextTick(() => $refs.abstract.focus());
                        "
                    >
                        <span ref="abstract">{{
                            currentPaper.abstract
                                ? currentPaper.abstract
                                : "Abstract missing."
                        }}</span>
                    </span>
                    <el-input
                        v-else
                        ref="abstract"
                        type="textarea"
                        v-model="currentPaper.abstract"
                        :autosize="{ minRows: 4 }"
                        placeholder="Abstract missing."
                        @change="
                            $store.commit('updatePaper', {
                                paper: currentPaper.id,
                                updates: { abstract: $event },
                            })
                        "
                        @blur="editing = false"
                    />
                </el-descriptions-item>

                <el-descriptions-item label="Keywords">
                    {{ currentPaper.keywords.join(", ") }}
                </el-descriptions-item>

                <el-descriptions-item
                    label="Paper Links"
                    v-if="currentPaper.doi"
                >
                    <el-button @click="openLink(currentPaper.doi, 'scihub')"
                        >Sci-Hub</el-button
                    >
                    <el-button @click="openLink(currentPaper.doi, 'doi')"
                        >DOI.org</el-button
                    >
                </el-descriptions-item>

                <el-descriptions-item label="Year">
                    {{ currentPaper.year }}
                </el-descriptions-item>

                <el-descriptions-item label="Notes">
                    <el-input
                        type="textarea"
                        v-model="currentPaper.notes"
                        :autosize="{ minRows: 4 }"
                        placeholder="Type out any notes here."
                        @change="
                            $store.commit('updatePaper', {
                                paper: currentPaper.id,
                                updates: { notes: $event },
                            })
                        "
                    />
                </el-descriptions-item>
            </el-descriptions>
        </el-row>
    </div>
</template>

<script>
import { nextTick } from 'vue';
import { open } from "@tauri-apps/api/shell";
import Mark from 'mark.js';

import { match } from '@/utils/search';

import TagEditor from "@/components/TagEditor.vue";

export default {
    name: "PaperPanel",
    components: {
        TagEditor,
    },
    emits: ["closePanel"],

    props: [
        "paper", 
        "filter", 
        "filterMethod", 
        "filterActive", 
        "height"
    ],

    data() {
        return {
            editing: false,
            currentPaper: null,
            abstractHighlight: null,
        };
    },

    methods: {
        openLink(doi, type) {
            if (type === "scihub") {
                open(`https://sci-hub.se/${doi}`);
            } else if (type === "doi") {
                open(`https://doi.org/${doi}`);
            }
        },

        highlight() {
            if (!this.currentPaper || this.filter.length === 0) return;
            try {
                const mark = new Mark(this.$refs.abstract);
                mark.unmark();
                console.log('highlight', this.currentPaper, this.filter, this.filterMethod, this.filterActive);
                if (this.filterMethod === 'boolean') {
                    const abstractMatches = match(this.filterMethod, this.currentPaper.abstract, this.filter);
                    nextTick(() => {
                        mark.markRanges(abstractMatches);
                    })
                } else if (this.filterMethod === 'regex'){
                    nextTick(() => {
                        mark.markRegExp(new RegExp(this.filter));
                    })
                }
            } catch {
                return;
            }
        },
    },

    mounted() {
        if (this.paper) {
            this.currentPaper = this.$store.state.papers[this.paper];
            this.highlight();
        }
    },

    watch: {
        paper () {
            if (this.paper) {
                this.currentPaper = this.$store.state.papers[this.paper];
                this.highlight();
            }
        }
    }
};
</script>