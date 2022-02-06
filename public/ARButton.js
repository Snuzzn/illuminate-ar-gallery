import { onSelect } from "./index.js";
class ARButton {
  static createButton(renderer, sessionInit = {}) {
    const button = document.createElement("button");

    function showStartAR(/*device*/) {
      if (sessionInit.domOverlay === undefined) {
        var overlay = document.createElement("div");
        overlay.style.display = "none";
        document.body.appendChild(overlay);
        overlay.id = "overlay";

        const gif = document.createElement("div");
        gif.id = "stabilising";
        overlay.appendChild(gif);

        const progressBar = document.createElement("div");
        progressBar.id = "progressBar";
        overlay.appendChild(progressBar);

        // const carousel = document.getElementById("carousel");
        // overlay.appendChild(carousel);
        const spawnBtn = document.createElement("button");
        spawnBtn.classList.add(
          "button",
          "button-3d",
          "button-circle",
          "button-jumbo"
        );
        const crossHairIcon = document.createElement("i");
        crossHairIcon.classList.add("fas", "fa-crosshairs");
        spawnBtn.appendChild(crossHairIcon);
        spawnBtn.style.zIndex = "1000000";
        spawnBtn.id = "spawnBtn";
        overlay.appendChild(spawnBtn);
        spawnBtn.addEventListener("click", onSelect);

        // const projectBtns = document.getElementById("projectBtns");
        // overlay.appendChild(projectBtns);
        const projectBtns = document.createElement("div");
        projectBtns.id = "projectBtns";
        const buttonClasses = [
          "projectBtn",
          "button",
          "button-large",
          "button-plain",
          "button-border",
          "button-circle",
        ];
        const modelPaths = [
          ["./models/Cube/cube.glb", "images/cube1.png"],
          [
            "./models/Crystallise/Crystallise-centered-draco.glb",
            "images/crystallise.png",
          ],
        ];
        for (const path of modelPaths) {
          const elem = document.createElement("button");
          elem.classList.add(...buttonClasses);
          elem.style.display = "flex";
          const img = document.createElement("img");
          img.src = path[1];
          img.classList.add("projectBtnImg");
          elem.appendChild(img);
          elem.addEventListener("click", () => {
            const modelPath = document.getElementById("modelPath");
            modelPath.innerHTML = path[0];
            // window.alert(modelPath.innerText);
          });
          projectBtns.appendChild(elem);
        }

        overlay.appendChild(projectBtns);

        // bar.animate(1);

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", 38);
        svg.setAttribute("height", 38);
        svg.style.position = "absolute";
        svg.style.right = "20px";
        svg.style.top = "20px";
        svg.addEventListener("click", function () {
          currentSession.end();
        });
        overlay.appendChild(svg);

        var path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        path.setAttribute("d", "M 12,12 L 28,28 M 28,12 12,28");
        path.setAttribute("stroke", "#fff");
        path.setAttribute("stroke-width", 2);
        svg.appendChild(path);

        if (sessionInit.optionalFeatures === undefined) {
          sessionInit.optionalFeatures = [];
        }

        sessionInit.optionalFeatures.push("dom-overlay");
        sessionInit.domOverlay = { root: overlay };
      }

      //

      let currentSession = null;

      async function onSessionStarted(session) {
        session.addEventListener("end", onSessionEnded);

        renderer.xr.setReferenceSpaceType("local");

        await renderer.xr.setSession(session);

        button.textContent = "STOP AR";
        sessionInit.domOverlay.root.style.display = "";

        currentSession = session;
      }

      function onSessionEnded(/*event*/) {
        currentSession.removeEventListener("end", onSessionEnded);

        button.textContent = "START AR";
        sessionInit.domOverlay.root.style.display = "none";

        currentSession = null;

        const mainContainer = document.getElementById("mainContainer");
        mainContainer.style.display = "none";
      }

      //

      button.style.display = "";

      button.style.cursor = "pointer";
      button.style.left = "calc(50% - 50px)";
      button.style.width = "100px";

      button.textContent = "START AR";

      button.onmouseenter = function () {
        button.style.opacity = "1.0";
      };

      button.onmouseleave = function () {
        button.style.opacity = "0.5";
      };

      button.onclick = function () {
        if (currentSession === null) {
          navigator.xr
            .requestSession("immersive-ar", sessionInit)
            .then(onSessionStarted);
        } else {
          currentSession.end();
        }
      };
    }

    function disableButton() {
      button.style.display = "";

      button.style.cursor = "auto";
      button.style.left = "calc(50% - 75px)";
      button.style.width = "150px";

      button.onmouseenter = null;
      button.onmouseleave = null;

      button.onclick = null;
    }

    function showARNotSupported() {
      disableButton();

      button.textContent = "AR NOT SUPPORTED";
    }

    function stylizeElement(element) {
      element.style.position = "absolute";
      element.style.bottom = "20px";
      element.style.padding = "12px 6px";
      element.style.border = "1px solid #fff";
      element.style.borderRadius = "4px";
      element.style.background = "rgba(0,0,0,0.1)";
      element.style.color = "#fff";
      element.style.font = "normal 13px sans-serif";
      element.style.textAlign = "center";
      element.style.opacity = "0.5";
      element.style.outline = "none";
      element.style.zIndex = "999";
    }

    if ("xr" in navigator) {
      button.id = "ARButton";
      button.style.display = "none";

      stylizeElement(button);

      navigator.xr
        .isSessionSupported("immersive-ar")
        .then(function (supported) {
          supported ? showStartAR() : showARNotSupported();
        })
        .catch(showARNotSupported);

      return button;
    } else {
      const message = document.createElement("a");

      if (window.isSecureContext === false) {
        message.href = document.location.href.replace(/^http:/, "https:");
        message.innerHTML = "WEBXR NEEDS HTTPS"; // TODO Improve message
      } else {
        message.href = "https://immersiveweb.dev/";
        message.innerHTML = "WEBXR NOT AVAILABLE";
      }

      message.style.left = "calc(50% - 90px)";
      message.style.width = "180px";
      message.style.textDecoration = "none";

      stylizeElement(message);

      return message;
    }
  }
}

export { ARButton };
