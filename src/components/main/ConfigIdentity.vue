<template>
    <a-modal
        :visible="visible"
        :closable="false"
        :simple="true"
        :footer="false"
        :mask-closable="false"
    >
        <template #title>
            <span v-if="firstTime">👋 Let collaborators know who you are</span>
            <span v-else>🔍 Let's make sure your identity is correct.</span>
        </template>
        <a-row justify="center" style="margin-bottom: 2rem">
            <Avatar refreshable :size="100"
                :salt="user.salt"
                :palette="user.palette"
                @refresh="newIcon"
            />
        </a-row>
        <a-row justify="center" style="color: gray; font-size: 0.7rem; margin-bottom: 1rem;">
            <span>
                Your contact information is needed to use citation services such as CrossRef and
                OpenAlex, and is also helpful when comparing inter-reviewer consistency
                across projects.
                <br />
                The data is stored locally on your machine.
                If you choose to distribute the project file, your name will become public,
                but your email will not.
            </span>
        </a-row>
        <a-row>
            <a-form :model="user" :style="{width:'600px'}" @submit="setIdentity">
                <a-form-item field="name" label="Name" :rules="[{
                    required: true,
                    message: 'Please enter your name.'
                }]" :validate-trigger="['change','input']">
                    <a-input v-model="user.name" placeholder="Enter your name here" />
                </a-form-item>
                <a-form-item field="email" label="Email" :rules="[{
                    required: true,
                    message: 'Please enter your email.'
                }]" :validate-trigger="['change','input']">
                    <a-input v-model="user.email" placeholder="Email to indicate your identity" />
                </a-form-item>
                <a-form-item>
                    <a-button html-type="submit">Confirm</a-button>
                </a-form-item>
            </a-form>
        </a-row>
    </a-modal>
</template>

<script>
import { nanoid } from 'nanoid';
import colors from 'flat-palettes';
import Avatar from '@/components/main/Avatar.vue';
import useSnowballStore from '@/store';

export default {
    name: 'ConfigIdentity',
    components: {
        Avatar,
    },
    inject: ['config'],
    setup: () => ({
        store: useSnowballStore(),
    }),
    props: {
        visible: Boolean,
    },

    data() {
        return {
            firstTime: true,
            user: {
                name: undefined,
                email: undefined,
                salt: nanoid(),
                palette: undefined,
            },
        };
    },

    computed: {
        initialized() {
            return this.user.name && this.user.email;
        },

        partiallyInitialized() {
            return this.user.name || this.user.email;
        },
    },

    methods: {
        setIdentity({ errors }) {
            if (errors) return;
            this.config.set('user', this.user);
            this.store.user = this.user;
            this.$emit('confirm');
        },

        newIcon() {
            this.user.salt = nanoid();
            this.user.palette = colors(5);
        },
    },

    mounted() {
        const userInfo = this.config.get('user');
        if (userInfo) {
            this.firstTime = false;
            this.user.name = userInfo.name;
            this.user.email = userInfo.email;
            this.user.salt = userInfo.salt;
            this.user.palette = userInfo.palette;
        }
    },
};
</script>
