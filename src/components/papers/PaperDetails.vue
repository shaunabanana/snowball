<template>
    <a-descriptions
        style="margin-top: 20px"
        :data="data"
        size="medium"
        title="You can customize modal body text by the current situation"
        :column="1"
    />
</template>

<script>
export default {
    name: 'PaperDetails',
    components: {},

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
                    value: 'Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing. Yingdu Building, Zhichun Road, Beijing',
                },
            ],
        };
    },
};
</script>
