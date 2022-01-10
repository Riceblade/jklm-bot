// import badWords from "./words";
//@ts-ignore
import words from "an-array-of-english-words";
import prompt from "prompt";
import puppeteer from "puppeteer";

(async function main() {
  try {
    prompt.start();
    const { url, real } = await prompt.get(["url", "real"]);

    if (!url.toString().toLowerCase().includes("https://jklm.fun/")) {
      console.log("URL invalid");
      process.exit(1);
    }

    console.log("Going to game at:" + url);
    // console.log("Username: " + username);

    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-web-security",
        // "--disable-features=IsolateOrigins,site-per-process",
        // "--autoplay-policy=user-gesture-required",
        // "--disable-background-networking",
        // "--disable-background-timer-throttling",
        // "--disable-backgrounding-occluded-windows",
        // "--disable-breakpad",
        // "--disable-client-side-phishing-detection",
        // "--disable-component-update",
        // "--disable-default-apps",
        // "--disable-dev-shm-usage",
        // "--disable-domain-reliability",
        // "--disable-extensions",
        // "--disable-features=AudioServiceOutOfProcess",
        // "--disable-hang-monitor",
        // "--disable-ipc-flooding-protection",
        // "--disable-notifications",
        // "--disable-offer-store-unmasked-wallet-cards",
        // "--disable-popup-blocking",
        // "--disable-print-preview",
        // "--disable-prompt-on-repost",
        // "--disable-renderer-backgrounding",
        // "--disable-setuid-sandbox",
        // "--disable-speech-api",
        // "--disable-sync",
        // "--hide-scrollbars",
        // "--ignore-gpu-blacklist",
        // "--metrics-recording-only",
        // "--mute-audio",
        // "--no-default-browser-check",
        // "--no-first-run",
        // "--no-pings",
        // "--no-sandbox",
        // "--no-zygote",
        // "--password-store=basic",
        // "--use-gl=swiftshader",
        // "--use-mock-keychain",
      ],
      headless: false,
    });

    const page = await browser.newPage();

    await page.goto(url.toString());

    await new Promise((r) => setTimeout(r, 2000));

    await page.waitForSelector(
      `body > div.pages > div.setNickname.page > form > div.line > button`,
      {
        hidden: false,
      }
    );

    await page.click(
      `body > div.pages > div.setNickname.page > form > div.line > button`
    );

    await page.waitForSelector("iframe");

    const elementHandle = (await page.$(
      "iframe"
    )) as puppeteer.ElementHandle<Element>;

    console.log("finding frame");
    const frame = (await elementHandle.contentFrame()) as puppeteer.Frame;
    await new Promise((r) => setTimeout(r, 2000));

    while (true) {
      const checkJoinable = await frame.$eval(".seating", (el) =>
        el.getAttribute("hidden")
      );
      console.log(checkJoinable, typeof checkJoinable);
      if (typeof checkJoinable === "string") continue;
      break;
    }

    await frame.click(`.joinRound`);
    console.log("Joined round");

    let startedCountDown: boolean = false;
    while (true) {
      const status = (await frame.$eval(
        ".status",
        (el) => el.textContent
      )) as string;

      if (status.toLowerCase().includes("waiting")) continue;

      const coolDown = status.match(/\d+/g) as string[];

      if (parseInt(coolDown[0])) {
        startedCountDown = true;
        console.log(parseInt(coolDown[0]));
      }

      if (!parseInt(coolDown[0]) && startedCountDown) break;
    }

    console.log("game started");

    while (true) {
      const checkTurn = await frame.$eval(".selfTurn", (el) =>
        el.getAttribute("hidden")
      );

      if (checkTurn) continue;
      console.log("your turn");
      const syllable = (await frame.$eval(
        ".syllable",
        (el) => el.textContent
      )) as string;

      const word = words.filter(
        (word: string) => word.includes(syllable) && word.length > 2
      );
      console.log(word[Math.floor(Math.random() * word.length)]);

      await frame.type(
        `input[maxLength="30"]`,
        word[Math.floor(Math.random() * word.length)],
        {
          delay: real.toString().includes("y") ? 100 : 0,
        }
      );
      await page.keyboard.press("Enter", { delay: 50 });
    }
  } catch (e) {
    console.log(e);
  }
})();
