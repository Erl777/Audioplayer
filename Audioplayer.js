
class Audioplayer {
    constructor(params) {
        const options = params || {};
        this.settings = {
            playlist: options.playlist
        };
        this.playBtn = document.getElementById('play');
        this.stopBtn = document.getElementById('stop');
        // let prevBtn = document.getElementById('prev');
        this.nextBtn = document.getElementById('next');
        this.input = document.querySelector('input[type="range"]');
        this.song = new Audio(this.settings.playlist[0]);
        this.player = document.querySelector('.player');
        this.id = 0;
        this.playlist = null;

        // console.log(this.settings.playlist);

        this.method1();
        this.addPlayList();
    }

    addPlayList(){
        // console.log(this.settings.playlist);
        for (let i = 1; i < this.settings.playlist.length; i++){

            let elem = this.settings.playlist[i];
            // console.log(elem);
            let song =  new Audio(elem);
            this.player.appendChild(song).setAttribute('data-id', `${i}`);
        }

        this.playlist = document.querySelectorAll('[data-id]');
    }

    method1 (){
        this.playBtn.addEventListener('click', this.startPlay);
        this.stopBtn.addEventListener('click', this.stopPlay);
        this.song.addEventListener('timeupdate', this.setTime);
        this.input.addEventListener('change', this.changeValue);
        this.player.appendChild(this.song).setAttribute('id', 'track');

        this.nextBtn.addEventListener('click', this.nextSong);

    }

    startPlay = (e) => {
        e.preventDefault();

        this.input.setAttribute('max', document.getElementById('track').duration);
        this.song.setAttribute('data-id', this.id);

        // for (let i = 0; i < this.playlist.length;i++){
        //     this.playlist[i].addEventListener('timeupdate', this.setTime);
        //     this.playlist[i].addEventListener('change', this.changeValue);
        // }

        this.song.play();
    };

    stopPlay = (e) =>{
        e.preventDefault();
        this.song.pause();
    };

    setTime = () =>{
        let curtime = parseInt(this.song.currentTime, 10);
        // this.input.setAttribute("value", curtime);
        this.input.value = curtime;
        console.log(curtime);
    };

    changeValue = () =>{
        this.song.currentTime = this.input.value;
        console.log('value changed');
    };

    nextSong = (e) =>{
        e.preventDefault();
        console.log('next song');
        this.song.pause();
        this.input.value = 0;

        if (this.id <= this.playlist.length){
            this.song = this.playlist[this.id];
            console.log(this.song);

            // this.input.setAttribute('value', '0');
            // this.input.setAttribute('max', this.song.duration);
            // this.song.currentTime = 0.0;
            this.input.max = this.song.duration;


            console.log(this.song.duration);
            this.song.addEventListener('timeupdate', this.setTime);

            this.song.play();
        }
        this.id++;


    }

}

new Audioplayer({
    playlist: ['music/TutTutChild_HotPursuit.mp3',
        'music/ac-dc-i-love-rock-and-roll(mp3-top.info).mp3',
        'music/tones-and-i-dance-monkey(mp3-top.info).mp3']
});
