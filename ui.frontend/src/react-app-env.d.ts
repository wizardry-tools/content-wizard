/// <reference types="react-scripts" />

import {Component} from "react";

declare module 'react' {
    interface CompositeRoute extends Component<any,any> {
        props: any
    }
}
declare module 'react-router-dom';