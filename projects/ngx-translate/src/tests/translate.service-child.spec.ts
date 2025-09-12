import { Component, inject } from "@angular/core";
import { fakeAsync, TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";
import {
    provideTranslateLoader,
    TranslateLoader,
    TranslatePipe,
    TranslateService,
    TranslationObject,
} from "../public-api";
import {
    provideTestableChildTranslateService,
    provideTestableTranslateService,
    TestableTranslateService,
} from "./test-helpers";

export interface User {
    firstName: string;
    lastName?: string;
}

export class FakeTranslateLoaderWithCounter implements TranslateLoader {
    public callCount = 0;

    constructor(private translations: TranslationObject) {}

    getTranslation(): Observable<TranslationObject> {
        this.callCount++;
        return of(this.translations);
    }
}

export class FakeChildLoader extends FakeTranslateLoaderWithCounter {
    constructor() {
        super({ "value-from-child": "i'm from child" });
    }
}

export class FakeRootLoader extends FakeTranslateLoaderWithCounter {
    constructor() {
        super({ "value-from-root": "i'm from root" });
    }
}

describe("TranslateService (child, separate loaders)", () => {
    let rootTranslateService: TestableTranslateService;
    let childTranslateService: TestableTranslateService;

    @Component({
        selector: "app-child-component",
        template: ` <div class="isolated-child">{{ "test" | translate }}</div> `,
        imports: [TranslatePipe],
        providers: [
            provideTestableChildTranslateService({
                loader: provideTranslateLoader(FakeChildLoader),
            }),
        ],
    })
    class ChildComponent {
        constructor() {
            childTranslateService = inject(TranslateService) as TestableTranslateService;
        }
    }

    @Component({
        imports: [ChildComponent],
        selector: "app-root-component",
        template: ` <app-child-component /> `,
        providers: [
            provideTestableTranslateService({ loader: provideTranslateLoader(FakeRootLoader) }),
        ],
    })
    class RootComponent {
        constructor() {
            rootTranslateService = inject(TranslateService) as TestableTranslateService;
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({});
        const fixture = TestBed.createComponent(RootComponent);
    });

    it("testSetup is ready", () => {
        expect(rootTranslateService).toBeDefined();
        expect(childTranslateService).toBeDefined();
    });

    it("should trigger loading on language switch from child and parent", fakeAsync(() => {
        const childLoader: FakeChildLoader =
            childTranslateService.getCurrentLoader() as FakeChildLoader;
        const rootLoader: FakeChildLoader =
            rootTranslateService.getCurrentLoader() as FakeChildLoader;

        childTranslateService.use("en");

        expect(rootLoader.callCount).toEqual(1);
        expect(childLoader.callCount).toEqual(1);

        expect(childTranslateService.instant("value-from-child")).toEqual("i'm from child");
        expect(childTranslateService.instant("value-from-root")).toEqual("i'm from root");
        expect(rootTranslateService.instant("value-from-child")).toEqual("i'm from child");
        expect(rootTranslateService.instant("value-from-root")).toEqual("i'm from root");

        rootTranslateService.use("de");

        expect(rootLoader.callCount).toEqual(2);
        expect(childLoader.callCount).toEqual(2);
    }));
});

describe("TranslateService (child, separate loaders, preload with lang=)", () => {
    let rootTranslateService: TestableTranslateService;
    let childTranslateService: TestableTranslateService;

    @Component({
        selector: "app-child-component",
        template: ` <div class="isolated-child">{{ "test" | translate }}</div> `,
        imports: [TranslatePipe],
        providers: [
            provideTestableChildTranslateService({
                loader: provideTranslateLoader(FakeChildLoader),
            }),
        ],
    })
    class ChildComponent {
        constructor() {
            childTranslateService = inject(TranslateService) as TestableTranslateService;
        }
    }

    @Component({
        imports: [ChildComponent],
        selector: "app-root-component",
        template: ` <app-child-component /> `,
        providers: [
            provideTestableTranslateService({
                loader: provideTranslateLoader(FakeRootLoader),
                lang: "en",
            }),
        ],
    })
    class RootComponent {
        constructor() {
            rootTranslateService = inject(TranslateService) as TestableTranslateService;
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({});
        const fixture = TestBed.createComponent(RootComponent);
    });

    it("testSetup is ready", () => {
        expect(rootTranslateService).toBeDefined();
        expect(childTranslateService).toBeDefined();
    });

    it("should load on start from child and parent", fakeAsync(() => {
        const childLoader: FakeChildLoader =
            childTranslateService.getCurrentLoader() as FakeChildLoader;
        const rootLoader: FakeChildLoader =
            rootTranslateService.getCurrentLoader() as FakeChildLoader;

        expect(childLoader.callCount).toEqual(1);
        expect(rootLoader.callCount).toEqual(2); // FIXME: the child service should not trigger loading again

        expect(childTranslateService.instant("value-from-child")).toEqual("i'm from child");
        expect(childTranslateService.instant("value-from-root")).toEqual("i'm from root");
        expect(rootTranslateService.instant("value-from-child")).toEqual("i'm from child");
        expect(rootTranslateService.instant("value-from-root")).toEqual("i'm from root");
    }));
});

describe("TranslateService (child, shared loader)", () => {
    let rootTranslateService: TestableTranslateService;
    let childTranslateService: TestableTranslateService;

    @Component({
        selector: "app-child-component",
        template: ` <div class="isolated-child">{{ "test" | translate }}</div> `,
        imports: [TranslatePipe],
        providers: [provideTestableChildTranslateService()],
    })
    class ChildComponent {
        constructor() {
            childTranslateService = inject(TranslateService) as TestableTranslateService;
        }
    }

    @Component({
        imports: [ChildComponent],
        selector: "app-root-component",
        template: ` <app-child-component /> `,
        providers: [
            provideTestableTranslateService({ loader: provideTranslateLoader(FakeRootLoader) }),
        ],
    })
    class RootComponent {
        constructor() {
            rootTranslateService = inject(TranslateService) as TestableTranslateService;
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({});
        const fixture = TestBed.createComponent(RootComponent);
    });

    it("testSetup is ready", () => {
        expect(rootTranslateService).toBeDefined();
        expect(childTranslateService).toBeDefined();
        expect(
            rootTranslateService.getCurrentLoader() === childTranslateService.getCurrentLoader(),
        ).toBeTruthy();
    });

    it("should trigger loading on language switch from child and parent", fakeAsync(() => {
        const rootLoader: FakeRootLoader =
            rootTranslateService.getCurrentLoader() as FakeRootLoader;

        childTranslateService.use("en");

        expect(rootLoader.callCount).toEqual(1);

        expect(childTranslateService.instant("value-from-root")).toEqual("i'm from root");
        expect(rootTranslateService.instant("value-from-root")).toEqual("i'm from root");

        rootTranslateService.use("de");

        expect(rootLoader.callCount).toEqual(2);
    }));
});
