import { XrmUiTest, TestUtils } from "d365-ui-test";
import * as fs from "fs";
import * as playwright from "playwright";
import * as path from "path";

const xrmTest = new XrmUiTest();
let browser: playwright.Browser = null;
let context: playwright.BrowserContext = null;
let page: playwright.Page = null;

describe("Work Order Operations", () => {
    beforeAll(async() => {
        jest.setTimeout(600000);

        await xrmTest.launch("chromium", {
            headless: !!process.env.D365_UI_TEST_HEADLESS,
            args: [
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--start-fullscreen',
                '--window-position=0,0',
                '--window-size=1920,1080',
                '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"'
            ]
        })
        .then(([b, c, p]) => {
            browser = b;
            context = c;
            page = p;
        });
    });

    test("Start D365", async () => {
        const settingsPath = path.join(__dirname, "../settings.txt");
        const settingsFound = fs.existsSync(settingsPath);
        const config = settingsFound ? fs.readFileSync(settingsPath, {encoding: "utf-8"}) : `${process.env.D365_UI_TEST_URL ?? process.env.CRM_URL ?? ""},${process.env.D365_UI_TEST_USERNAME ?? process.env.USER_NAME ?? ""},${process.env.D365_UI_TEST_PASSWORD ?? process.env.USER_PASSWORD ?? ""},${process.env.D365_UI_TEST_MFA_SECRET ?? process.env.MFA_SECRET ?? ""}`;
        
        const [url, user, password, mfaSecret] = config.split(",");

        await xrmTest.open(url, { userName: user, password: password, mfaSecret: mfaSecret ?? undefined });
    });

    test("Open ROM App", async () => {
        await xrmTest.Navigation.openAppById("69f5a3be-42c9-4d6a-a5ab-236a3b6b60eb");
    });

    test("Create SATR Boarding Gate", TestUtils.takeScreenShotOnFailure(() => page, path.join("reports", "CreateSATRBoardingGate.png"), async () => {

        // Open a new work order form and fill it out
        await xrmTest.Navigation.openCreateForm("msdyn_workorder");
        await xrmTest.Attribute.setValue("msdyn_workordertype", [{"entityType":"msdyn_workordertype","id":"{B1EE680A-7CF7-EA11-A815-000D3AF3A7A7}","name":"Inspection"}]);
        await xrmTest.Attribute.setValue("ts_region", [{"entityType":"territory","id":"{50B21A84-DB04-EB11-A813-000D3AF3AC0D}","name":"Ontario Region"}]);
        await xrmTest.Attribute.setValue("ovs_operationtypeid", [{"entityType":"ovs_operationtype","id":"{8B614EF0-C651-EB11-A812-000D3AF3AC0D}","name":"Air Carrier (Passenger)"}]);
        await xrmTest.Attribute.setValue("ts_tradenameid", [{"entityType":"ts_tradename","id":"{D3042A28-73F4-EB11-94EF-000D3A09C1C3}","name":"Air Canada"}]);
        await xrmTest.Attribute.setValue("ts_site", [{"entityType":"msdyn_functionallocation","id":"{D09AD58F-4DE3-EB11-BACB-0022486D8278}","name":"TORONTO/LESTER B. PEARSON INTERNATIONAL AIRPORT"}]);
        await xrmTest.Attribute.setValue("msdyn_primaryincidenttype", [{"entityType":"msdyn_incidenttype","id":"{1B66022E-4975-EB11-A812-0022486D69CB}","name":"SATR Boarding Gate"}]);
        await xrmTest.Entity.save(true);

        // Wait 30 seconds before refreshing service tasks subgrid
        await page.waitForTimeout(30000);
        await xrmTest.SubGrid.refresh("workorderservicetasksgrid");
        await page.waitForTimeout(3000); // Wait 3 seconds for the UI to catch up and show the refreshed service tasks

        // Only expect one service task
        const serviceTasksCount = await xrmTest.SubGrid.getRecordCount("workorderservicetasksgrid");
        expect(serviceTasksCount).toEqual(1);

    }));

    afterAll(() => {
        return xrmTest.close();
    });
});
