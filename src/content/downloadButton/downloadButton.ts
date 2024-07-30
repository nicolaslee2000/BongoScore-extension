import "./downloadButton.css";
import "@loadingio/loading.css/loading.min.css";
import "ldbutton/index.min.css";
import BongoIdle from "../../assets/BongoCat.png";
import BongoRunning from "../../assets/BongoCat.gif";

import $ from "jquery";

const icon = $("<img>")
  .attr({
    height: "30",
    width: "30",
    alt: "Bongo Cat",
  })
  .attr("src", BongoIdle)
  .css({
    "object-fit": "scale-down",
    "margin-left": "5px",
  });

const spinner = $("<div></div>").addClass("ld ld-ring ld-spin");

const button = $("<button></button>")
  .attr({
    type: "button",
    name: "download",
    id: "download",
  })
  .addClass("ld-ext-right")
  .append("Download")
  .append(icon)
  .append(spinner);

export const setIsButtonRunning = (isRunning: boolean) => {
  button
    .addClass(isRunning ? "running" : "")
    .removeClass(isRunning ? "" : "running")
    .prop("disabled", isRunning);
  icon.attr("src", isRunning ? BongoRunning : BongoIdle);
};

export default button;

window.addEventListener("load", () => {
  const oldButton = $("button[name='download'");
  button.addClass(oldButton.attr("class") ?? "");
});
