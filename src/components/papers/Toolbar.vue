<template>
    <a-space>
        <a-button type="primary">Primary</a-button>
        <a-button>Secondary</a-button>
        <a-input-search
            :style="{ width: '320px' }"
            placeholder="Please enter something"
            search-button
        />
    </a-space>
</template>

<script>
export default {
    name: 'PaperToolbar',
    components: {},
};
</script>
