<template>
    <a-descriptions size="medium" :column="1">
        <a-descriptions-item label="Location">
            <a-typography-paragraph style="margin-bottom: 0" ellipsis copyable>
                <template #copy-icon> <icon-link />Open </template>
                <template #copy-tooltip>
                    Show the project file in your native file browser
                </template>
                {{$store.state.projectPath}}
            </a-typography-paragraph>
        </a-descriptions-item>

        <a-descriptions-item label="Remote URL">
            <a-typography-paragraph style="margin-bottom: 0" ellipsis copyable>
                <template #copy-icon><icon-link />Open</template>
                <template #copy-tooltip>
                    Open the repository link in your browser.
                </template>
                https://github.com/shaunabanana/snowball.git
            </a-typography-paragraph>
        </a-descriptions-item>
    </a-descriptions>
</template>

<script>
export default {
    name: 'ProjectDescriptions',

    computed: {
    },
};
</script>
