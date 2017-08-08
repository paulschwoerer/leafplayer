import search, {
    SET_QUERY,
    RESET_SEARCH,
    PERFORM_SEARCH,
    SET_SEARCH_TO_BUSY,
    SET_SEARCH_TO_NOT_BUSY,
} from './search';

export const SearchNamespace = 'search';

export const SearchMutationTypes = {
    SET_QUERY: `${SearchNamespace}/${SET_QUERY}`,
    RESET_SEARCH: `${SearchNamespace}/${RESET_SEARCH}`,
    PERFORM_SEARCH: `${SearchNamespace}/${PERFORM_SEARCH}`,
    SET_SEARCH_TO_BUSY: `${SearchNamespace}/${SET_SEARCH_TO_BUSY}`,
    SET_SEARCH_TO_NOT_BUSY: `${SearchNamespace}/${SET_SEARCH_TO_NOT_BUSY}`,
};

export default search;
