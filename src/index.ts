// add styles
import './style.css';
import {Viewer} from "./Viewer";

const viewer = new Viewer(document.querySelector('#viewer'));

viewer.init('./test.fbx', {
    legs: {
        objects: ['Obj_000008', 'Obj_000007', 'Obj_000006', 'Obj_000005', 'Obj_000004', 'Obj_000003', 'Obj_000002', 'Obj_000001'],
        texture: './texture2.jpg'
    },
    uphostery: {
        objects: ['Obj_000009'],
        texture: './texture.jpg'
    }
});
