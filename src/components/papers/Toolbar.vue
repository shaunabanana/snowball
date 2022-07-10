<template>
    <a-row>
        <a-col :span="12">
            <a-space>
                <a-button type="primary" :disabled="canSnowball" @click="$emit('snowball')">
                    Snowball »
                </a-button>
                <a-dropdown v-if="$store.state.selection.length === 0"
                    position="br"
                    @select="$emit('export', $event)"
                >
                    <a-button>Export Sheet <icon-down/></a-button>
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
                <a-button-group v-if="$store.state.selection.length > 1">
                    <a-button @click="$store.commit('updatePaper', {
                        paper: $store.state.selection,
                        updates: { decision: 'exclude' }
                    })">
                        <template #icon>
                            <icon-close />
                        </template>
                        Exclude
                    </a-button>
                    <a-button @click="$store.commit('updatePaper', {
                        paper: $store.state.selection,
                        updates: { decision: 'undecided' }
                    })">
                        <template #icon>
                            <icon-question />
                        </template>
                        Clear
                    </a-button>
                    <a-button @click="$store.commit('updatePaper', {
                        paper: $store.state.selection,
                        updates: { decision: 'include' }
                    })">
                        <template #icon>
                            <icon-check />
                        </template>
                        Include
                    </a-button>
                </a-button-group>

                <a-button v-if="$store.state.selection.length > 0"
                    @click="newSheetFromSelected"
                >
                    <template #icon>
                        <icon-plus />
                    </template>
                    To new sheet
                </a-button>
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
                        <span v-if="$store.state.filter.length > 0">
                            <span v-if="!syntaxError">
                                {{this.$store.getters.currentPapers.length}} filtered.
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

export default {
    name: 'PaperToolbar',
    components: {
        Tutorial,
        TagModal,
    },
    emits: ['snowball', 'export'],
    data() {
        return {
            filter: '',
            method: 'Boolean',
            filteredCount: 0,
            showModal: false,
        };
    },
    computed: {
        canSnowball() {
            return this.$store.getters.currentPapers.every(
                (paper) => paper.decision !== 'include',
            );
        },

        syntaxError() {
            return this.$store.state.filterError && this.filter === this.$store.state.filter;
        },
    },
    methods: {
        filterPapers() {
            this.$store.commit('setFilter', {
                filter: this.filter,
                method: this.method,
                tagsOnly: false,
            });
            // this.filteredCount = this.$store.getters.currentPapers.length;
        },

        createFilterTag() {
            this.showModal = true;
        },

        newSheetFromSelected() {
            const sheetId = `layer-${Object.keys(this.$store.state.sheets).length}`;
            const sheetName = `Layer ${Object.keys(this.$store.state.sheets).length}`;
            console.log(`[Toolbar][newSheetFromSelected] Adding new sheet (${sheetId}) named '${sheetName}'.`);
            this.$store.commit('addSheet', {
                id: sheetId, name: sheetName, papers: this.$store.state.selection,
            });
            console.log(`[Toolbar][newSheetFromSelected] Setting active sheet to '${sheetId}'.`);
            this.$store.commit('setActiveSheet', sheetId);
        },
    },
    watch: {
        '$store.state.filter': {
            deep: true,
            handler() {
                this.filter = this.$store.state.filter;
                this.filteredCount = this.$store.getters.currentPapers.length;
            },
        },

        method() {
            console.log(`[Toolbar][Watch] Filtering method changed to '${this.method}'.`);
            if (this.filter.length > 0 && this.$store.state.filter === this.filter) {
                console.log(`[Toolbar][Watch] Re-filtering with '${this.method}'.`);
                this.$store.commit('setFilter', {
                    filter: this.filter,
                    method: this.method,
                    tagsOnly: false,
                });
            }
        },
    },
};
</script>
