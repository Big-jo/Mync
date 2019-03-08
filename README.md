# Mync
    An app for streaming songs bewteen two users.

- There are two pages, the **Sync Page** and the **Partner Page**

- The Sync Page generates a key that is used as a filename on the server

- The partner(whoever the key is given to) can stream the song

----------
# Technicalities 
    - Uploading
            The music file is broken into chunks and sent
            to the server in chunks, each chunk when recieved,
            is put into a temporary folder called "temp"  and then restructed 
            from there, into another folder called "user_songs".
            every 30mins that folder is empitied.

    -  Streaming
         This is straight forward process, the song is taken from the 
         song folder and then piped through the response.
        
**Issues**
-  File system fails to write files to the temp folder when deployed on heroku and Google Compute Engine but works locally.



