<template>
    <div class="note-container" @mousedown="focus">
        <a-space direction="horizontal" size="mini">
            <a-button-group>
                <a-button type="text" size="small" @click="heading(1)">
                    <template #icon><icon-h1 /></template>
                </a-button>
                <a-button type="text" size="small" @click="heading(2)">
                    <template #icon><icon-h2 /></template>
                </a-button>
                <a-button type="text" size="small" @click="heading(3)">
                    <template #icon><icon-h3 /></template>
                </a-button>
            </a-button-group>
            <a-divider direction="vertical" />
            <a-button-group>
                <a-button type="text" size="small" @click="bold">
                    <template #icon><icon-bold /></template>
                </a-button>
                <a-button type="text" size="small" @click="italic">
                    <template #icon><icon-italic /></template>
                </a-button>
            </a-button-group>
            <a-divider direction="vertical" />
            <a-button-group>
                <a-button type="text" size="small" @click="list">
                    <template #icon><icon-unordered-list /></template>
                </a-button>
                <a-button type="text" size="small" @click="todo">
                    <template #icon><icon-check-square /></template>
                </a-button>
            </a-button-group>
            <a-divider direction="vertical" />
            <a-button-group>
                <a-button type="text" size="small" @click="lift">
                    <template #icon><icon-menu-fold /></template>
                </a-button>
                <a-button type="text" size="small" @click="sink">
                    <template #icon><icon-menu-unfold /></template>
                </a-button>
            </a-button-group>
        </a-space>
        <editor-content
            class="no-outline"
            :editor="editor"
            @mousedown.stop
            @keydown.tab.stop.prevent
            @keyup.tab.stop.prevent
        />
    </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';

export default {
    components: {
        EditorContent,
    },
    props: {
        modelValue: {
            type: Object,
            default: () => ({ type: 'doc', content: [] }),
        },
    },
    emits: ['update:modelValue'],

    data() {
        return {
            editor: null,
        };
    },

    mounted() {
        this.editor = new Editor({
            content: this.modelValue,
            extensions: [
                StarterKit,
                TaskItem,
                TaskList,
                Placeholder.configure({
                    placeholder: 'Write here your thoughts, plans, to-dos... Anything.',
                    showOnlyWhenEditable: false,
                }),
            ],
            onUpdate: () => {
                this.$emit('update:modelValue', this.editor.getJSON());
            },
        });
    },

    beforeUnmount() {
        this.editor.destroy();
    },

    watch: {
        modelValue(value) {
            const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value);
            if (isSame) return;
            this.editor.commands.setContent(value, false);
        },
    },

    methods: {
        focus() {
            this.editor.commands.focus();
        },

        heading(level) {
            this.editor.chain().focus().toggleHeading({ level }).run();
        },

        bold() {
            this.editor.chain().focus().toggleBold().run();
        },
        italic() {
            this.editor.chain().focus().toggleItalic().run();
        },

        list() {
            this.editor.chain().focus().toggleBulletList().run();
        },

        todo() {
            this.editor.chain().focus().toggleTaskList().run();
        },

        sink() {
            this.editor.chain().focus().sinkListItem('listItem').run();
        },
        lift() {
            this.editor.chain().focus().liftListItem('listItem').run();
        },
    },
};
</script>

<style>
.note-container {
    width: calc(100% - 2rem);
    height: calc(100% - 1rem);
    padding: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    background: var(--color-fill-1);
    border-radius: 3px;
    border: 1px solid transparent;
    overflow-y: scroll;
    cursor: text;
    transition:
        background-color 0.1s cubic-bezier(0, 0, 1, 1),
        border-color 0.1s cubic-bezier(0, 0, 1, 1);
}

.note-container:hover {
    background: var(--color-fill-2);
    border: 1px solid transparent;
}

.note-container:focus,.note-container:focus-within {
    background: var(--color-bg-1);
    border: 1px solid rgb(var(--primary-6));
}

.ProseMirror {
    padding-bottom: 1rem !important;
    outline:none;
}

.ProseMirror h1 {
    font-size: 1.5em;
}

.ProseMirror h2 {
    font-size: 1.2em;
}

.ProseMirror h3 {
    font-size: 1em;
}

.ProseMirror p {
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
}

.ProseMirror ul {
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
    padding-inline-start: 15px;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-fill-4);
  pointer-events: none;
  height: 0;
}

ul[data-type="taskList"] {
    list-style: none;
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
    padding-inline-start: 3px;
}

ul[data-type="taskList"] p {
    margin: 0;
    margin-block-start: -1px;
    margin-block-end: 0.5em;
}

ul[data-type="taskList"] li {
    display: flex;
}

ul[data-type="taskList"] li label {
    flex: 0 0 auto;
    margin-right: 0.5rem;
    user-select: none;
}

ul[data-type="taskList"] li div {
    flex: 1 1 auto;
}
</style>
