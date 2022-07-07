<template>
    <a-tooltip position="bottom" mini :content-style="{'max-width': '40rem'}">
        <slot />
        <template #content>
            <div v-if="method === 'Boolean'">
                <p><b>A B</b> matches papers that mentions A and/or B anywhere.</p>
                <p><b>"A B"</b> matches papers that contains exactly the phrase "A B".</p>
                <p><b>A AND B</b> matches papers that mentions both A and B.</p>
                <p><b>A OR B</b> matches papers that mentions A and/or B anywhere.</p>
                <p><b>NOT A</b> matches papers that does not mention A anywhere.</p>
                <p><b>A NEAR/n B</b> requires that A and B are n words or less apart.</p>
                <p>
                    <b>A ONEAR/n B</b> does the same as <b>NEAR/n</b>,
                    while also requires A to appear before B.
                </p>
                <p><b>?</b> matches any one letter.</p>
                <p><b>*</b> matches any number of letters.</p>
                <p><b>()</b> can be used to group parts of the query.</p>
                <p>
                    Operators can be combined freely,
                    e.g., <b>"A B" AND NOT "A C*" OR (A ONEAR/3 D) AND E</b>
                </p>
                <p>
                    Operators have different priorities.
                    For example, <b>A OR B AND C</b> = <b>A OR (B AND C)</b>,
                    because <b>AND</b> has higher priority than <b>OR</b>.
                </p>
                <p>
                    Operators priorities are ordered as such:
                    <b>""?*</b> > <b>()</b> > <b>ONEAR</b> > <b>NEAR</b> > <b>NOT</b> >
                    <b>AND</b> > <b>OR</b>.
                </p>
            </div>
            <div v-if="method === 'RegExp'">
                RegExp tutorial
            </div>
        </template>
    </a-tooltip>
</template>

<script>
export default {
    name: 'SearchTutorial',
    props: {
        method: String,
    },
};
</script>
