export const createDragImage = (text) => {
    let element = document.getElementById('drag-element-representation');

    if (!element) {
        element = document.createElement('div');
        element.id = 'drag-element-representation';
        element.appendChild(document.createElement('p'));
        document.body.appendChild(element);
    }

    element.firstElementChild.innerHTML = text;

    return element;
};
