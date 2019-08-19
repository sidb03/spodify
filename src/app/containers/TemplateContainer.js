import { Container } from 'unstated';

export default class TemplateContainer extends Container {
    state = {
        activeTemplate: 'mySongs'
    }

    changeTemplate = activeTemplate => {
        console.log("actve template", activeTemplate);
        this.setState( { activeTemplate });
    }
}

export const templateContainer = new TemplateContainer();