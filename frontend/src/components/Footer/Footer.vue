<template>
    <div class="component-footer">
        <footer>
            <p>LeafPlayer ALPHA <small>© {{year}} Paul Schwörer</small></p>
        </footer>
    </div>
</template>

<script>
    export default {
        name: 'ComponentFooter',

        computed: {
            year() {
                return new Date().getFullYear();
            },
        },
    };
</script>

<style src="./Footer.scss" lang="scss"></style>
