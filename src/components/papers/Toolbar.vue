<template>
    <a-row>
        <a-col :span="12">
            <a-space>
                <a-button type="primary">Primary</a-button>
                <a-button>Secondary</a-button>
            </a-space>
        </a-col>
        <a-col :span="12" style="padding-right: 1rem">
            <a-input-search placeholder="Enter filter criteria..." search-button allow-clear>
                <template #prepend>
                    <a-select
                        default-value="Boolean"
                        placeholder="Select"
                        :trigger-props="{ autoFitPopupMinWidth: true }"
                    >
                        <a-option>Boolean</a-option>
                        <a-option>RegExp</a-option>
                    </a-select>
                </template>
                <template #suffix> 36 filtered. </template>
            </a-input-search>
        </a-col>
    </a-row>
</template>

<script>
export default {
    name: 'PaperToolbar',
    components: {},
};
</script>
