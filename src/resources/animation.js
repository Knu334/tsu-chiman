(function () {
    'use strict';

    (function () {
        const jsTextSelector = '.text';
        const jsText = document.querySelectorAll(jsTextSelector);
        jsText.forEach(target => {
            let newText = '';
            const text = target.textContent;
            const result = text.split('');
            for (let i = 0; i < result.length; i++) {
                newText += '<span>' + result[i] + '</span>';
            }
            target.innerHTML = newText;
        });
    })();

    (function () {
        const jsTextSelector = '.text span';
        const jsProcedureSlector = '.procedure li';
        const jsButtonSelecotr = '#registration_button';
        const jsUnsubscribeSelector = '#unsubscribe';
        const divSuccessSelector = '#success';
        const divFailedSelector = '#failed';
        gsap.set(jsTextSelector,
            {
                opacity: 0,
                y: 30
            }
        );

        gsap.set(jsProcedureSlector,
            {
                opacity: 0,
                x: 100
            }
        );

        gsap.set(divSuccessSelector,
            {
                autoAlpha: 0
            }
        );

        gsap.set(divFailedSelector,
            {
                autoAlpha: 0
            }
        );

        gsap.set(jsButtonSelecotr, {
            autoAlpha: 0
        })

        gsap.set(jsUnsubscribeSelector, {
            autoAlpha: 0
        })

        const tl = gsap.timeline();
        tl.to(jsTextSelector, {
            opacity: 1,
            y: 0,
            stagger: {
                amount: 1,
                from: "start",
                ease: "sine.in"
            }
        }).to(jsProcedureSlector, {
            opacity: 1,
            x: 0,
            stagger: {
                amount: 1,
                from: "start",
                ease: "sine.in"
            }
        }).to(jsButtonSelecotr, {
            autoAlpha: 1,
            duration: 5
        }).to(jsUnsubscribeSelector, {
            autoAlpha: 1,
            duration: 5
        }, '<');
    })();


    
})();

let showSuccess = () => {
    const selector = '#success';
    const tl = gsap.timeline();
    tl.to(selector, {
        autoAlpha: 1
    }).to(selector, {
        autoAlpha: 0
    }, 3);
};

let showFailed = () => {
    let selector = '#failed';
    const tl = gsap.timeline();
    tl.to(selector, {
        autoAlpha: 1
    }).to(selector, {
        autoAlpha: 0
    }, 3);
}