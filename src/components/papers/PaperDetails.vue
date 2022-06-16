<template>
    <a-button type="text">
        <template #icon>
            <IconClose />
        </template>
        <!-- Use the default slot to avoid extra spaces -->
        <template #default>Close</template>
    </a-button>
    <a-descriptions
        size="medium"
        layout="vertical"
        style="padding: 0.5rem; padding-left: 1rem"
        :data="data"
        title="You can customize modal body text by the current situation"
        :column="1"
    />

    Comments
    <div style="padding: 0.5rem; padding-left: 1rem; margin-bottom: 10rem">
        <a-comment author="Shengchen" datetime="1 hour" align="right">
            <template #actions>
                <span class="action" key="heart">
                    <span v-if="false">
                        <IconHeartFill :style="{ color: '#f53f3f' }" />
                    </span>
                    <span v-else>
                        <IconHeart />
                    </span>
                    83
                </span>
                <span class="action" key="star">
                    <span v-if="false">
                        <IconStarFill
                            style="
                                 {
                                    color: '#ffb400';
                                }
                            "
                        />
                    </span>
                    <span v-else>
                        <IconStar />
                    </span>
                    3
                </span>
                <span class="action" key="reply"> <IconMessage /> Reply </span>
            </template>
            <template #content>
                <div>
                    A design is a plan or specification for the construction of an object or system
                    or for the implementation of an activity or process, or the result of that plan
                    or specification in the form of a prototype, product or process.
                </div>
            </template>
        </a-comment>
    </div>
</template>

<script>
import {
    IconClose,
    IconHeart,
    IconHeartFill,
    IconStar,
    IconStarFill,
    IconMessage,
} from '@arco-design/web-vue/es/icon';

export default {
    name: 'PaperDetails',
    components: {
        IconClose,
        IconHeart,
        IconHeartFill,
        IconStar,
        IconStarFill,
        IconMessage,
    },

    data() {
        return {
            data: [
                {
                    label: 'Name',
                    value: 'Socrates',
                },
                {
                    label: 'Mobile',
                    value: '123-1234-1234',
                },
                {
                    label: 'Residence',
                    value: 'Beijing',
                },
                {
                    label: 'Hometown',
                    value: 'Beijing',
                },
                {
                    label: 'Address',
                    value: 'Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing, Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing, Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing, Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing,Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing, Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing',
                },
            ],
        };
    },
};
</script>
