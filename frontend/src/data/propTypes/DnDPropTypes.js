import VueTypes from 'vue-types';
import DnDTypes from 'data/enum/DnDTypes';

const type = VueTypes.oneOf([
    DnDTypes.SONG,
]);

export default {
    type,
};
