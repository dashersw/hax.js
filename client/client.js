// Copyright (c) 2009-2010 Techinox Information Technologies (http://www.techinox.com)
// Techinox Commercial License
//
// @author Armagan Amcalar <armagan@tart.com.tr>

var socket = io.connect('http://localhost:3001');

socket.on('mahmut', function(data) {
    console.log('x');
})