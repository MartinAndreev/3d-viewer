// add styles
import "./style.css";
import { Viewer } from "./Viewer";

const viewer = new Viewer(document.querySelector("#viewer"));

const texturesMap = [
  {
    name: "Finish",
    objects: [
      "Obj_000008",
      "Obj_000007",
      "Obj_000006",
      "Obj_000005",
      "Obj_000004",
      "Obj_000003",
      "Obj_000002",
      "Obj_000001",
    ],
    texture: "./textures/finish/finish-1.jpg",
  },
  {
    name: "Uphostery",
    objects: ["Obj_000009"],
    texture: "./textures/uphostery/uphostery-2.jpg",
  },
];

document.querySelectorAll("[data-toggle]").forEach((e) => {
  e.addEventListener("click", (e) => {
    const target = e.target as HTMLImageElement;

    const textureMap = texturesMap.filter(
      (t) => t.name === target.dataset.target
    )[0];

    viewer.changeTexture({ ...textureMap, texture: target.src });
  });
});

document.getElementById("export").addEventListener("click", () => {
  viewer.export();
});

document.getElementById("auto-rotate").addEventListener("click", (e) => {
  const target = e.target as HTMLFormElement;
  viewer.getControls().autoRotate = target.checked;
});

document.getElementById("show-helpers").addEventListener("click", (e) => {
  const target = e.target as HTMLFormElement;

  if (target.checked) {
    viewer.showHelpers();
  } else {
    viewer.removeHelpers();
  }
});

viewer.init("./test.3ds", texturesMap);
