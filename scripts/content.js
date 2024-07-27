// global variables
const downloadButton = document.createElement("button");
const urls = [];

// on document load
const init = () => {
  createDownloadButton();

  const oldButton = document.querySelector('button[name="download"]');
  if (oldButton) {
    oldButton.parentNode.replaceChild(downloadButton, oldButton);
  }

  // download event
  downloadButton.addEventListener("click", handleOnClick);
};

const createDownloadButton = () => {
  // new download button
  downloadButton.type = "button";
  downloadButton.name = "download";
  downloadButton.textContent = "Download";
  downloadButton.id = "download";

  // musescore button default classes
  downloadButton.classList.add(
    "TtlUw",
    "R1reb",
    "r6afg",
    "HFvdW",
    "tDPQ9",
    "nOTLW",
    "utani",
    "s_klh",
    "u_VDg"
  );

  // button loader class
  downloadButton.classList.add("ld-ext-right");

  // spinner
  const spinner = document.createElement("div");
  spinner.classList.add("ld", "ld-ring", "ld-spin");

  // button icon
  const icon = document.createElement("img");
  icon.src = chrome.runtime.getURL("assets/bongoCat.png");
  icon.setAttribute("height", "25");
  icon.setAttribute("width", "25");
  icon.setAttribute("alt", "bongo cat");
  icon.style.marginLeft = "5px";

  downloadButton.appendChild(spinner);
  downloadButton.appendChild(icon);
};

const handleOnClick = async (e) => {
  e.preventDefault();
  downloadButton.disabled = true;
  downloadButton.classList.add("running");
  try {
    await download();
  } catch (e) {
    alert("unknown downloader extension error" + e);
  }
  downloadButton.disabled = false;
  downloadButton.classList.remove("running");
};

const download = async () => {
  await getUrls();
  for (url of urls) {
    console.log(url);
  }
};

const getUrls = async () => {
  const ifr = document.createElement("iframe");
  ifr.src = window.location.href;
  ifr.style.width = "1000px";
  ifr.style.height = "300000px";
  ifr.style.position = "fixed";
  document.body.appendChild(ifr);
  const pageCount = getPageCount();
  // wait for musescore to send requests
  if (pageCount !== null) {
    let tries = 0;
    while (pageCount > urls.length) {
      if (tries > 10) {
        break;
      }
      await delay(0.5);
      tries++;
    }
  } else {
    await delay(5);
  }

  document.body.removeChild(ifr);
};

const getPageCount = () => {
  const match = document
    .getElementById("jmuse-scroller-component")
    ?.firstChild?.querySelector("img")
    ?.getAttribute("alt")
    ?.match(/\d+ of (\d+) pages/);
  if (match) {
    return Number(match[1]);
  }
  return null;
};

window.addEventListener("load", init);

function delay(s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}
