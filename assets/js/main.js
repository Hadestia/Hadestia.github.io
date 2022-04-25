(function () {
    "use strict"
    
    function sleepThread(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    
    const select = (el, all = false) => {
        el = el.trim()
        if (all) {
            return [...document.querySelectorAll(el)]
        } else {
            return document.querySelector(el)
        }
    }
    
    /* ======= PORTFOLIO ======= */
    const addPortfolioSection = (name, data) => {
        let nodeFilter = '<li data-filter=".filter-' + data +'">' + name + '</li>'
        $('#portfolio-flters').append(nodeFilter)
    }
    
    const addPortfolioContent = (sec, obj) => {
        if (!obj) {
            console.log('Unable to retrieve a nil object')
            return
        }
        let alt = obj.alt || ''
        //let section = obj.section
        let forward = obj.forward || true
        let title = obj.title || 'Untitled'
        let link = obj.link || 'portfolio-details.html'
        let source = 'assets/img/portfolio/' + obj.source
        
        let project = '<div class="col-lg-4 col-md-6 portfolio-item filter-' + sec + '"><div class="portfolio-wrap">'
        project += '<img src="' + source + '" class="img-fluid" alt="' + alt + '">'
        project += '<div class="portfolio-links">'
        //project += '<a href="' + source + '" data-gallery="portfolioGallery" class="portfolio-lightbox" title="' + title + '"><i class="bx bx-plus"></i></a>'
        if (forward) {
            project += '<a href="' + link + '" title="More Details"><i class="bx bx-link"></i></a>'
        }
        project += '</div></div></div>'
        
        $('.portfolio-container').append(project)
    }
    
    /* ======= Iteration Through Objects ======= */
    fetch('assets/json/main.json').then(function(dataResponse) {
        if (!dataResponse.ok) {
            alert('Error: ' + dataResponse.status + ': Unable to retrieve contents')
            return
        }
        dataResponse.json().then(async function(data) {
            let pf_fltr = data.portfolio.filters //filters
            let pf_cntnts = data.portfolio.contents //contents
            
            // #portfolio - filters
            await Object.keys(pf_fltr).forEach(function(name) {
                addPortfolioSection(name, pf_fltr[name])
            })
            // #portfolio - contents
            Object.keys(pf_cntnts).forEach(function(sec_name) {
                let sec_cntnts = pf_cntnts[sec_name]
                Object.keys(sec_cntnts).forEach(function(obj) {
                    addPortfolioContent(sec_name, sec_cntnts[obj])
                })
            })
            
        })
    }).catch(function(err) { alert((err.stack).toString()) })
    
    
    /* ======= FORMS: Discord Embedding ======= */
   function createEmbedJson(name, email, subject, mssg) {
        let utc = new Date().toISOString()
        subject = '•' + subject
        let embed = {"content": null,"embeds": [{"title": subject,"description": mssg,"color": 11004306,"fields": [{"name": "Contact email:","value": email,"inline": true}],"author": {"name": name,"icon_url": "https://img.icons8.com/dusk/344/user.png"},"footer": {"text": "Hadestia: portfolio © 2022","icon_url": "https://hadestia.github.io/assets/img/webicon.png"},"timestamp": utc}],"attachments": []}
        return embed
    }
    
    async function decodeWebhook(obj_name, en_host, en_key) {
        let de_key = await CryptoJS.AES.decrypt(en_key, obj_name).toString(CryptoJS.enc.Utf8)
        let de_host = await CryptoJS.AES.decrypt(en_host, de_key).toString(CryptoJS.enc.Utf8)
        return de_host
    }
    
    async function sendEmbedRequest(form) {
        displayFormStatus(form, 1) // loading display
        let wh_path = 'assets/' + form.getAttribute('ref-path')
        let wh_obj = form.getAttribute('obj-ref')
        // get user inputs
        let name = form.querySelector('#username').value
        let mssg = form.querySelector('#message').value
        let email = form.querySelector('#email').value
        let subjct = form.querySelector('#subject').value
        
        fetch(wh_path).then(function(whjson) {
            if (!whjson.ok) {
                displayFormStatus(form, 0, 5000, 'Error' + embed_response.status + ': Attempting to find a null host')
                return
            }
            whjson.json().then(async function(data) {
                let en_host = data[wh_obj].ref
                let en_key = data[wh_obj].key
                let whurl = await decodeWebhook(wh_obj, en_host, en_key)
                await fetch(whurl, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(createEmbedJson(name, email, subjct, mssg))}).then(function(embed_response) {
                    if (!embed_response.ok) {
                        displayFormStatus(form, 0, 5000, 'Error' + embed_response.status + ': Unable to reach host')
                        return
                    }
                    displayFormStatus(form, 2)
                    form.querySelector('#username').value = '';
                    form.querySelector('#email').value = '';
                    form.querySelector('#subject').value = '';
                    form.querySelector('#message').value = '';
                    return
                }).catch(function(err) {
                    displayFormStatus(form, 0, 5000, (err.stack).toString())
                })
            })
            
        }).catch(function(err) {
            displayFormStatus(form, 0, 5000, (err.stack).toString())
        })
    }
    
    let forms = select('.webhook-email-form', true)
    
    forms.forEach(function(e) {
        e.addEventListener('submit', function(event) {
            event.preventDefault()
            let form = this
            sendEmbedRequest(form)
        })
    })
    
    
    /* ======= FORM STATUS MESSAGE ======= */
    async function displayFormStatus(form, code, sleep = 4000, err_message = '') {
        function setStatus(active = '', error = '') {
            let className = ['.loading', '.error-message', '.sent-message']
            let i
            for (i = 0; i < className.length; i++) {
                let cn = className[i]
                if (active == cn) {
                    form.querySelector('.error-message').innerHTML = error
                    form.querySelector(cn).classList.add('d-block')
                } else {
                    form.querySelector(cn).classList.remove('d-block')
                }
            }
        }
        // code: 0 - error; 1 - loading; 2 - sent
        if (code == 0) {
            setStatus('.error-message', err_message)
            await sleepThread(sleep)
            setStatus()
        } else if (code == 1) {
            setStatus('.loading')
        } else if (code == 2) {
            setStatus('.sent-message')
            await sleepThread(sleep)
            setStatus()
        }
    }
})()