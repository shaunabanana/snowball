<template>
    <a-row>
        <a-col :span="12">
            <a-space>
                <a-dropdown position="br" @select="$emit('export', $event)" >
                    <a-button>
                        {{
                            store.selection.length === 0
                                ? 'Export Sheet'
                                : `Export Selected`
                        }}
                        <icon-down/>
                    </a-button>
                    <template #content>
                        <a-dgroup title="Reference Managers">
                            <a-doption value="RIS">RIS (Recommended)</a-doption>
                            <a-doption value="BibTeX">BibTeX</a-doption>
                        </a-dgroup>
                        <a-dgroup title="Human-readable">
                            <a-doption value="CSV">CSV</a-doption>
                        </a-dgroup>
                    </template>
                </a-dropdown>
                <a-button-group v-if="store.selection.length > 1">
                    <a-button @click="updateSelectedDecisions('exclude')">
                        <template #icon>
                            <icon-close />
                        </template>
                        Exclude
                    </a-button>
                    <a-button @click="updateSelectedDecisions('undecided')">
                        <template #icon>
                            <icon-question />
                        </template>
                        Clear
                    </a-button>
                    <a-button @click="updateSelectedDecisions('include')">
                        <template #icon>
                            <icon-check />
                        </template>
                        Include
                    </a-button>
                </a-button-group>

                <span v-if="store.selection.length" style="color: var(--color-text-2)">
                    {{store.selection.length}} selected.
                </span>
            </a-space>
        </a-col>
        <a-col :span="12" style="padding-right: 1rem">
            <Tutorial :method="method">
                <a-input-search search-button allow-clear
                    placeholder="Enter filter criteria..."
                    v-model="filter"
                    :error="syntaxError"
                    @search="filterPapers"
                    @press-enter="filterPapers"
                    @clear="filterPapers"
                >
                    <template #prepend>
                        <a-select
                            :default-value="method"
                            placeholder="Select"
                            :trigger-props="{ autoFitPopupMinWidth: true }"
                            @change="method = $event"
                        >
                            <a-option>Boolean</a-option>
                            <a-option>RegExp</a-option>
                        </a-select>
                    </template>
                    <template #suffix>
                        <span v-if="store.filter.length > 0">
                            <span v-if="!syntaxError">
                                {{store.filteredPapers.length}} filtered.
                            </span>

                            <span v-else style="color: rgb(var(--red-6))">
                                Wrong search syntax
                            </span>

                            <a-button v-if="!syntaxError" size="mini" type="text"
                                @click="createFilterTag"
                            >
                                Save as tag...
                            </a-button>
                        </span>
                    </template>
                </a-input-search>
            </Tutorial>
        </a-col>
    </a-row>
    <TagModal :type="'auto'" :visible="showModal" :filter="filter" @close="showModal=false"/>
</template>

<script>
import Tutorial from '@/components/papers/Tutorial.vue';
import TagModal from '@/components/tags/TagModal.vue';

import useSnowballStore from '@/store';

export default {
    name: 'PaperToolbar',
    components: {
        Tutorial,
        TagModal,
    },
    emits: ['snowball', 'export'],
    setup: () => ({
        store: useSnowballStore(),
    }),

    data() {
        return {
            filter: '',
            method: 'Boolean',
            filteredCount: 0,
            showModal: false,
        };
    },
    computed: {
        syntaxError() {
            return this.store.filterError && this.filter === this.store.filter;
        },
    },
    methods: {
        filterPapers() {
            console.log('changing filters', this.filter, this.method);
            this.store.filter = this.filter;
            this.store.filterMethod = this.method;
            this.store.filterTags = [];
            this.store.filterChanged = true;
        },

        createFilterTag() {
            this.showModal = true;
        },

        updateSelectedDecisions(decision) {
            this.store.selection.forEach((paperId) => {
                this.store.edit(this.store.activeSheet, paperId, { decision });
            });
        },
    },
    watch: {
        'store.filter': {
            deep: true,
            handler() {
                this.filter = this.store.filter;
                this.filteredCount = this.store.currentPapers.length;
            },
        },

        method() {
            console.log(`[Toolbar][Watch] Filtering method changed to '${this.method}'.`);
            if (this.filter.length > 0 && this.$store.state.filter === this.filter) {
                console.log(`[Toolbar][Watch] Re-filtering with '${this.method}'.`);
                this.filterPapers();
            }
        },
    },
};
</script>
