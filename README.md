# _Audioplayer_ 

## Settings
You can reassign controls buttons using your id: <br>
* startBtnId: 'playNew', <br>
* stopBtnId: 'stopNew', <br>
* nextBtnId: 'nextNew', <br>
* prevBtnId: 'prevNew'  <br>

You can turn off the next and prev buttons. Just write: <br>
* buttonsSwitches: false ( it is true by default )

## Methods

1. addNewSongToPlaylist ( songSrc, playlistName, newSongName, reloadCurrentPlaylist );
1. deleteSongFromPlaylist ( playlistName , songId , reloadCurrentPlaylist );
1. addNewPlaylist ( newPlaylistName, reloadCurrentPlaylist );
1. deletePlaylist ( playlistName );
1. saveNewSongName ( playlistName, newSongName, songId, reloadCurrentPlaylist );

reloadCurrentPlaylist can be reload, true or false

## Events for
Song
* beforeSongAdded - activates before new song added
* addSongToPlaylist - activates after new song added
* deleteSong - activates after song deleted
----------------------
SongName
* beforeSongNameChanged - activates before song name changed
* changeSongName - activates after song name changed
----------------------
Playlist
* addPlaylist - activates after playlist added
* deletePlaylist - activates after playlist deleted
----------------------
Playlist container
* beforePlaylistReload - coming soon
* playlistReloaded - coming soon
----------------------
Playlists container
* beforePlaylistsReload - coming soon
* playlistsReloaded - coming soon