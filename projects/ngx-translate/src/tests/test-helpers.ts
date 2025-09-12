import { Injectable, Provider } from "@angular/core";
import { Observable, of, timer } from "rxjs";
import { map } from "rxjs/operators";
import {
    provideTranslateService,
    provideChildTranslateService,
    RootTranslateServiceConfig,
    TranslateCompiler,
    TranslateLoader,
    TranslateService,
    TranslationObject,
} from "../public-api";

@Injectable()
export class DelayedFakeLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<TranslationObject> {
        const translations: Record<string, TranslationObject> = {
            en: { TEST: "This is a test" },
            fr: { TEST: "C'est un test" },
        };

        return timer(9).pipe(map(() => translations[lang]));
    }
}

@Injectable()
export class FakeLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<TranslationObject> {
        const translations: Record<string, TranslationObject> = {
            en: { TEST: "This is a test" },
            fr: { TEST: "C'est un test" },
        };

        return of(translations[lang]);
    }
}

export class TestableTranslateService extends TranslateService {
    public getCurrentLoader(): TranslateLoader {
        return this.currentLoader;
    }

    public getCompiler(): TranslateCompiler {
        return this.compiler;
    }
}

export function provideTestableTranslateService(
    config: RootTranslateServiceConfig = {},
): Provider[] {
    return provideTranslateService({
        translateServiceClass: TestableTranslateService,
        ...config,
    });
}

export function provideTestableChildTranslateService(
    config: RootTranslateServiceConfig = {},
): Provider[] {
    return provideChildTranslateService({
        translateServiceClass: TestableTranslateService,
        ...config,
    });
}
