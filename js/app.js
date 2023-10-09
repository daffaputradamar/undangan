const audio = (() => {
    let instance = null;

    let createOrGet = () => {
        if (instance instanceof HTMLAudioElement) {
            return instance;
        }

        instance = new Audio();
        instance.autoplay = true;
        instance.src = document.getElementById('tombol-musik').getAttribute('data-url');
        instance.load();
        instance.currentTime = 0;
        instance.volume = 1;
        instance.muted = false;
        instance.loop = true;

        return instance;
    }

    return {
        play: () => {
            createOrGet().play();
        },
        pause: () => {
            createOrGet().pause();
        }
    };
})();

const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const salin = (btn, msg = null) => {
    navigator.clipboard.writeText(btn.getAttribute('data-nomer'));
    let tmp = btn.innerHTML;
    btn.innerHTML = msg ?? 'Tersalin';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = tmp;
        btn.disabled = false;
        btn.focus();
    }, 1500);
};

const timer = () => {
    let countDownDate = (new Date(document.getElementById('tampilan-waktu').getAttribute('data-waktu').replace(' ', 'T'))).getTime();
    let time = null;
    let distance = null;

    time = setInterval(() => {
        distance = countDownDate - (new Date()).getTime();

        if (distance < 0) {
            clearInterval(time);
            time = null;
            return;
        }

        document.getElementById('hari').innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
        document.getElementById('jam').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('menit').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('detik').innerText = Math.floor((distance % (1000 * 60)) / 1000);
    }, 1000);
};

const buka = async () => {
    window.scrollTo(0, 0);
    document.getElementById('tombol-musik').style.display = 'block';
    audio.play();
    AOS.init();
    
    timer();
};

const play = (btn) => {
    if (btn.getAttribute('data-status').toString() != 'true') {
        btn.setAttribute('data-status', 'true');
        audio.play();
        btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
    } else {
        btn.setAttribute('data-status', 'false');
        audio.pause();
        btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    }
};

const resetForm = () => {
    document.getElementById('kirim').style.display = 'block';
    document.getElementById('hadiran').style.display = 'block';
    document.getElementById('labelhadir').style.display = 'block';
    document.getElementById('batal').style.display = 'none';
    document.getElementById('kirimbalasan').style.display = 'none';
    document.getElementById('idbalasan').value = null;
    document.getElementById('balasan').innerHTML = null;
    document.getElementById('formnama').value = null;
    document.getElementById('hadiran').value = 0;
    document.getElementById('formpesan').value = null;
};

const parseRequest = (method, token = null, body = null) => {
    let req = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        req.headers['Authorization'] = 'Bearer ' + token;
    }

    if (body) {
        req.body = JSON.stringify(body);
    }

    return req;
};

const getUrl = (optional = null) => {
    let url = document.querySelector('body').getAttribute('data-url');

    if (optional) {
        return url + optional;
    }

    return url;
};

const balasan = async (button, msg = null) => {
    button.disabled = true;
    let tmp = button.innerText;
    button.innerText = msg ?? 'Loading...';

    let id = button.getAttribute('data-uuid').toString();
    let token = localStorage.getItem('token') ?? '';

    if (token.length == 0) {
        alert('Terdapat kesalahan, token kosong !');
        window.location.reload();
        return;
    }

    const BALAS = document.getElementById('balasan');
    BALAS.innerHTML = renderLoading(1);
    document.getElementById('hadiran').style.display = 'none';
    document.getElementById('labelhadir').style.display = 'none';

    await fetch(getUrl('/api/comment/' + id), parseRequest('GET', token))
        .then((res) => res.json())
        .then((res) => {
            if (res.code == 200) {
                document.getElementById('kirim').style.display = 'none';
                document.getElementById('batal').style.display = 'block';
                document.getElementById('kirimbalasan').style.display = 'block';
                document.getElementById('idbalasan').value = id;

                BALAS.innerHTML = `
                <div class="card-body bg-light shadow p-3 my-2 rounded-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-center">
                        <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                            <strong>${escapeHtml(res.data.nama)}</strong>
                        </p>
                        <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${res.data.created_at}</small>
                    </div>
                    <hr class="text-dark my-1">
                    <p class="text-dark m-0 p-0" style="white-space: pre-line">${escapeHtml(res.data.komentar)}</p>
                </div>`;
            }

            if (res.error.length != 0) {
                if (res.error[0] == 'Expired token') {
                    alert('Terdapat kesalahan, token expired !');
                    window.location.reload();
                    return;
                }

                alert(res.error[0]);
            }
        })
        .catch((err) => {
            resetForm();
            alert(err);
        });

    document.getElementById('ucapan').scrollIntoView({ behavior: 'smooth' });
    button.disabled = false;
    button.innerText = tmp;
};


const renderLoading = (num) => {
    let hasil = '';
    for (let index = 0; index < num; index++) {
        hasil += `
        <div class="mb-3">
            <div class="card-body bg-light shadow p-3 m-0 rounded-4">
                <div class="d-flex flex-wrap justify-content-between align-items-center placeholder-glow">
                    <span class="placeholder bg-secondary col-5"></span>
                    <span class="placeholder bg-secondary col-3"></span>
                </div>
                <hr class="text-dark my-1">
                <p class="card-text placeholder-glow">
                    <span class="placeholder bg-secondary col-6"></span>
                    <span class="placeholder bg-secondary col-5"></span>
                    <span class="placeholder bg-secondary col-12"></span>
                </p>
            </div>
        </div>`;
    }

    return hasil;
};


const progressBar = (() => {
    let bar = document.getElementById('bar');
    let second = 0;
    let counter = 0;
    let stop = false;

    const sleep = (until) => new Promise((p) => {
        setTimeout(p, until);
    });

    const setNum = (num) => {
        bar.style.width = num + "%";
        bar.innerText = num + "%";

        return num == 100 || stop;
    };

    (async () => {
        while (true) {
            if (stop || setNum(counter)) {
                break;
            }

            await sleep(second);
            second += (counter * counter);
            counter += 1;
        }
    })();

    return {
        stop: () => {
            stop = true;
            setNum(100.0);
        }
    };
})();

const opacity = () => {
    let modal = new Promise((res) => {
        let clear = null;
        clear = setInterval(() => {
            if (document.getElementById('modalInit').classList.contains('show')) {
                clearInterval(clear);
                res();
            }
        }, 100);
    });

    modal.then(() => {
        progressBar.stop();

        let op = parseInt(document.getElementById('loading').style.opacity);
        let clear = null;

        clear = setInterval(() => {
            if (op >= 0) {
                op -= 0.025;
                document.getElementById('loading').style.opacity = op;
            } else {
                clearInterval(clear);
                document.getElementById('loading').remove();
                document.getElementById('modalInit').classList.add('fade');
            }
        }, 10);
    });
};

const modalFoto = (img) => {
    let modal = new bootstrap.Modal('#modalFoto');
    document.getElementById('showModalFoto').src = img.src;
    modal.show();
};

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    let initPromises = [
        fetch("data/common.json")
            .then(response => response.json())
        , fetch("data/guests.json")
            .then(response => response.json())
        , fetch("data/config.json")
            .then(response => response.json())
    ]

    let modal = new bootstrap.Modal('#modalInit');
    let name = (new URLSearchParams(window.location.search)).get('to') ?? 'Undangan';

    Promise.all(initPromises)
        .then(([common, guests, config]) => {
            //set initial page
            document.getElementById("event-prefix").innerHTML = common.event.prefix
            document.getElementById("event-name").innerHTML = common.event.name

            //set home page
            document.getElementById("home-event-name").innerHTML = common.event.name

            //set mempelai
            document.getElementById("pria").innerHTML = common.pria
            document.getElementById("pria-title").innerHTML = common.orangtua.pria.title
            document.getElementById("pria-ortu").innerHTML = `Bapak ${common.orangtua.pria.bapak} & Ibu ${common.orangtua.pria.ibu}`

            document.getElementById("wanita").innerHTML = common.wanita
            document.getElementById("wanita-title").innerHTML = common.orangtua.wanita.title
            document.getElementById("wanita-ortu").innerHTML = `Bapak ${common.orangtua.wanita.bapak} & Ibu ${common.orangtua.wanita.ibu}`


            let curGuest = guests[name.toUpperCase()]
            let _host = curGuest ? curGuest.host : (new Date('2023-11-05') >= new Date()) ? 'dila' : 'daffa'
            let curConfig = config[_host]

            document.getElementById("home-event-date").innerHTML = curConfig.day

            document.getElementById('tampilan-waktu').setAttribute('data-waktu', curConfig.countdown)

            document.getElementById("home-event-savethedate").href = curConfig.saveTheDate
            document.getElementById("tanggal-map").href = curConfig.maps
            document.getElementById("tanggal-place").innerHTML = curConfig.place

            let eventsDiv = document.getElementById("events")
            eventsDiv.innerHTML = ""
            curConfig.events.forEach(event => {
                eventsDiv.innerHTML += `
                <div class="py-2" data-aos="fade-left" data-aos-duration="1500">
                    <h1 class="font-estetik" style="font-size: 2rem;">${event.name}</h1>
                    <p>${event.schedule}</p>
                </div>
                `
            })

            if (curGuest && !curGuest['hiderek']) {
                document.getElementById("ucapan-logo").src = curConfig.rekening.logo
                document.getElementById("ucapan-norek").innerHTML = curConfig.rekening.norek
                document.getElementById("ucapan-atasnama").innerHTML = curConfig.rekening.atasnama
                document.getElementById('ucapan-norek-salin').setAttribute('data-nomer', curConfig.rekening.norek)
            } else {
                document.getElementById('container-norek').remove()
            }




            if (name.length == 0) {
                document.getElementById('namatamu').remove();
            } else {
                let div = document.createElement('div');
                div.classList.add('m-2');
                div.innerHTML = `
                <p class="mt-0 mb-1 mx-0 p-0 text-light">Kepada Yth Bapak/Ibu/Saudara/i</p>
                <h5 class="text-light">${escapeHtml(name)}</h5>
                `;

                document.getElementById('namatamu').appendChild(div);
            }

            modal.show();
            opacity();
        })

}, false);

function capitalizeWords(arr) {
    const _arr = arr.split(" ")
    return _arr.map(word => {
      const firstLetter = word.charAt(0).toUpperCase();
      const rest = word.slice(1).toLowerCase();
  
      return firstLetter + rest;
    }).join(" ");
  }
