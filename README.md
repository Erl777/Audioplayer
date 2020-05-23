#_Audioplayer_ 

##Settings
You can reassign controls buttons using your id: <br>
* startBtnId: 'playNew', <br>
* stopBtnId: 'stopNew', <br>
* nextBtnId: 'nextNew', <br>
* prevBtnId: 'prevNew'  <br>

You can turn off the next and prev buttons. Just write: <br>
* buttonsSwitches: false

##Methods

1. addNewSongToPlaylist(songSrc, playlistName, newSongName, reloadCurrentPlaylist);
1. deleteSongFromPlaylist( playlistName , songId , reloadCurrentPlaylist);
1. addNewPlaylist(newPlaylistName, reloadCurrentPlaylist);
1. deletePlaylist(playlistName);
1. saveNewSongName(playlistName, newSongName, songId, reloadCurrentPlaylist);

reloadCurrentPlaylist can be reload, true or false

##Events
* addSongToPlaylist - activates after song added
* deleteSong - activates after song deleted
* changeSongName - activates after song name changed
* addPlaylist - activates after playlist added
* deletePlaylist - activates after playlist deleted