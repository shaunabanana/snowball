<template>
    <a-descriptions size="medium" :column="1">
        <a-descriptions-item label="Location">
            <a-typography-paragraph ellipsis copyable
                style="margin-bottom: 0"
                @copy="openLocation"
            >
                <template #copy-icon> <icon-link/>Show </template>
                <template #copy-tooltip>
                    Show the project file in your native file browser
                </template>
                {{location}}
            </a-typography-paragraph>
        </a-descriptions-item>

        <!-- <a-descriptions-item label="Remote URL">
            <a-typography-paragraph style="margin-bottom: 0" ellipsis copyable>
                <template #copy-icon><icon-link />Open</template>
                <template #copy-tooltip>
                    Open the repository link in your browser.
                </template>
                https://github.com/shaunabanana/snowball.git
            </a-typography-paragraph>
        </a-descriptions-item> -->
    </a-descriptions>
</template>

<script>
import { dirname } from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';

export default {
    name: 'ProjectDescriptions',

    computed: {
        location() {
            return dirname(this.$store.state.projectPath);
        },
    },

    methods: {
        openLocation() {
            ipcRenderer.send('show-file', `${this.$store.state.projectPath}`);
        },
    },
};
</script>
