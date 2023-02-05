<template>
    <a-tooltip :content="tooltip" :disabled="tooltip.length === 0" position="bottom">
        <div class="avatar-mask" :style="forceMask ? {
            width: `${size}px`,
            height: `${size}px`,
            'border-radius': `${size}px`,
            overflow: 'hidden'
        }: {}">
            <a-avatar :size="size" :auto-fix-font-size="false"
                :style="{ cursor: 'pointer' }"
            >
                <Avatar v-if="salt.length > 0"
                    :size="size" variant="beam"
                    :colors="palette"
                    :style="{'margin-top': `${size/16}px`}"
                    :name="salt"
                />
                <template #trigger-icon v-if="refreshable">
                    <icon-refresh @click="$emit('refresh')"/>
                </template>
            </a-avatar>
        </div>
    </a-tooltip>
</template>

<script>
import Avatar from 'vue-boring-avatars';

export default {
    name: 'UserAvatar',
    components: { Avatar },
    props: {
        size: Number,
        salt: { type: String, default: '' },
        palette: {
            type: Array,
            default: () => (['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']),
        },
        refreshable: {
            type: Boolean,
            default: false,
        },
        tooltip: {
            type: String,
            default: '',
        },
        forceMask: {
            type: Boolean,
            default: false,
        },
    },
};
</script>
