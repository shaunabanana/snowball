<template>
    <a-tooltip :content="tooltip" :disabled="tooltip.length === 0" position="bottom">
        <a-avatar :size="size" :auto-fix-font-size="false"
            :style="{ cursor: 'pointer' }"
        >
            <Avatar v-if="seed.length > 0"
                :size="size" variant="beam"
                :style="{'margin-top': `${size/16}px`}" :name="seed"
            />
            <template #trigger-icon v-if="refreshable">
                <icon-refresh @click="$emit('refresh')"/>
            </template>
        </a-avatar>
    </a-tooltip>
</template>

<script>
import Avatar from 'vue-boring-avatars';

export default {
    name: 'UserAvatar',
    components: { Avatar },
    props: {
        size: Number,
        seed: String,
        refreshable: {
            type: Boolean,
            default: false,
        },
        tooltip: {
            type: String,
            default: '',
        },
    },
};
</script>
