(function () {
  "use strict";
   
  let forms = document.querySelectorAll('.webhook-email-form');

  forms.forEach( function(e) {
      e.addEventListener('submit', function(event) {
          event.preventDefault();
          
          let form = this;
          SendEmbedRequest(form);
          //CreateEmbedRequest(form);
      });
  });
  
  async function SendEmbedRequest(form) {
      DisplayStatus(form, 1);
      let path = 'assets/' + form.getAttribute('ref-path');
      let object_name = form.getAttribute('obj-ref');
      //user inputs
      let name = form.querySelector('#username').value;
      let mssg = form.querySelector('#message').value; 
      let email = form.querySelector('#email').value;
      let subject = form.querySelector('#subject').value;
      let embed = await CreateEmbed(name, email, subject, mssg);
      fetch(path).then(
          function(response) {
              if (!response.ok) {
                  DisplayStatus(form, 2, 'Error occurred, status:' + response.status);
                  return;
              } else {
                  response.json().then(
                      async function(data) {
                          let en_host = data[object_name].ref;
                          let en_key = data[object_name].key;
                          let whurl = await GetDiscordWebhook(object_name, en_host, en_key);
                          await fetch(whurl,
                              {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(CreateEmbed(name, email, subject, mssg))}
                          ).then(
                              function(embed_response) {
                                  if (!embed_response.ok) {
                                      DisplayStatus(form, 2, 'Error occurred, status:' + embed_response.status);
                                      return;
                                  } else {
                                      DisplayStatus(form, 3);
                                      return;
                                  }
                              }
                          ).catch(function(err) {
                              DisplayStatus(form, 2, err.toString());
                              return;
                          });
                      }
                  );
              }
          }
      ).catch(function(err) {
          DisplayStatus(form, 2, err.toString());
      });
      
  }
  
  async function GetDiscordWebhook(obj_name, en_host, en_key) {
      let de_key = await CryptoJS.AES.decrypt(en_key, obj_name).toString(CryptoJS.enc.Utf8);
      let de_host = await CryptoJS.AES.decrypt(en_host, de_key).toString(CryptoJS.enc.Utf8);
      return de_host;
  }
  
  async function DisplayStatus(form, state, error = 'Unexpected Error') {
      form.querySelector('.loading').classList.remove('d-block');
      form.querySelector('.error-message').classList.remove('d-block');
      form.querySelector('.sent-message').classList.remove('d-block');
      
      if (state == 1) {
          form.querySelector('.loading').classList.add('d-block');
      } else if (state == 2) {
          console.log(error);
          form.querySelector('.error-message').innerHTML = error;
          form.querySelector('.error-message').classList.add('d-block');
          await sleep(4000);
          form.querySelector('.error-message').classList.remove('d-block');
      } else if (state == 3) {
          form.querySelector('.sent-message').classList.add('d-block');
          await sleep(4000);
          //delete users input data
          form.querySelector('#username').value = '';
          form.querySelector('#email').value = '';
          form.querySelector('#subject').value = '';
          form.querySelector('#message').value = '';
          form.querySelector('.sent-message').classList.remove('d-block');
      }
  }
  
  function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  function CreateEmbed(name, email, subject, mssg) {
      subject = '•' + subject;
      let utc = new Date().toISOString();
      let embed = {"content": null,"embeds": [{"title": subject,"description": mssg,"color": 11004306,"fields": [{"name": "Contact email:","value": email,"inline": true}],"author": {"name": name,"icon_url": "https://img.icons8.com/dusk/344/user.png"},"footer": {"text": "Hadestia: portfolio © 2022","icon_url": "https://hadestia.github.io/assets/img/webicon.png"},"timestamp": utc}],"attachments": []};
      return embed;
  }
  
})();