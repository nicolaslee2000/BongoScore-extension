import button, { setIsButtonRunning } from "./downloadButton/downloadButton";
import $ from "jquery";
import pdfMake from "pdfmake/build/pdfmake";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";

// on document load
const init = () => {
  button.on("click", handleOnClick);
  $("button[name='download'").replaceWith(button);
};

const handleOnClick = async (e: JQuery.Event) => {
  e.preventDefault();
  setIsButtonRunning(true);
  try {
    await download();
  } catch (e) {
    alert("unknown downloader extension error" + e);
    throw e;
  }
  setIsButtonRunning(false);
};

const download = async () => {
  const ifr = $("<iframe></iframe>")
    .attr("src", window.location.href)
    .css({
      width: "1000px",
      height: "300000px",
      position: "fixed",
    })
    .appendTo($(document.body));
  const pageCount = getPageCount();
  const tokens: string[] = [];
  const scoreId = getScoreId();
  if (!scoreId) {
    alert("bongoscore: scoreid unavailable");
    return;
  }
  let tries = 0;
  let index = 1;
  while (index < pageCount) {
    if (tries > 10) {
      alert("bongoscore: download timeout!");
      return;
    }
    tries++;
    const tokenObj = await chrome.storage.session.get(`${scoreId}?${index}`);
    if (Object.keys(tokenObj).length !== 0) {
      tokens[index] = tokenObj[`${scoreId}?${index}`];
      index++;
    } else {
      await delay(0.5);
    }
  }
  $(ifr).remove();
  const images: Blob[] = [];
  images[0] = await fetch(getFirstScoreUrl()).then((res) => res.blob());
  for (let i = 1; i < pageCount; i++) {
    images[i] = await fetchImg(scoreId, i, tokens[i]);
  }
  await downloadPDF(images);
};

const fetchImg = async (scoreId: string, index: number, token: string) => {
  return await fetch(
    `https://musescore.com/api/jmuse?id=${scoreId}&index=${index}&type=img`,
    { headers: { authorization: token } }
  )
    .then((res) => (res.ok ? res.json() : null))
    .then((json) => json.info.url)
    .then((url) => fetch(url))
    .then((res) => res.blob());
};

const downloadPDF = async (imgs: Blob[]) => {
  const contents: Content = [];
  for (let i = 0; i < imgs.length; i++) {
    if (imgs[i].type === "image/svg+xml") {
      contents[i] = {
        svg: getResizedSvgViewport(await imgs[i].text()),
        height: 842,
        width: 595,
      };
    } else {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString() ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(imgs[i]);
      });
      contents[i] = {
        image: dataUrl,
        height: 842,
        width: 595,
      };
    }
  }

  const docDefinition: TDocumentDefinitions = {
    content: contents,
    pageMargins: 0,
    pageSize: "A4",
    info: {
      title: getScoreName(),
    },
  };
  const file = pdfMake.createPdf(docDefinition);
  file.download(getScoreName());
};

const getResizedSvgViewport = (svgStr: string) => {
  const svgDom = new DOMParser().parseFromString(
    svgStr,
    "image/svg+xml"
  ).firstChild;
  if (!svgDom) {
    return "";
  }
  const height = $(svgDom).children().first().attr("height");
  const width = $(svgDom).children().first().attr("width");
  $(svgDom).children().first().attr("viewBox", `0 0 ${width} ${height}`);
  return new XMLSerializer().serializeToString(svgDom);
};

const getPageCount = () => {
  return $("#jmuse-scroller-component").children().length - 2;
};

const getScoreId = () => {
  const paths = new URL(window.location.href).pathname.split("/");
  return paths.pop() || paths.pop();
};

const getScoreName = () => {
  return (
    $('meta[property="og:title"]').attr("content")?.toString() ?? "untitled"
  );
};

const getFirstScoreUrl = () => {
  const scripts = $('script[type="application/ld+json"]');

  for (const script of scripts) {
    try {
      const obj = JSON.parse($(script).text());

      if (obj?.["@type"] !== "MusicComposition") continue;

      if (obj?.thumbnailUrl) return obj.thumbnailUrl;
    } catch (e) {
      alert("bongoscore: error during thumbnail scraping" + e);
    }
  }
};

window.addEventListener("load", init);

function delay(s: number) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}
