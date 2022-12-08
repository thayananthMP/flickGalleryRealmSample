import React, {Component} from 'react';
import {Stylesheet, Image, SafeAreaView, Text, View} from 'react-native';
import axios from 'axios';

const getFlickrImageURL = (photo, size) => {
  let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}`;
  if (size) {
    // Configure image size
    url += `_${size}`;
  }
  url += '.jpg';
  console.log(url);
  return url;
};

const getImageURL = () => {
  axios
    .get(
      'https://www.flickr.com/services/rest/?method=flickr.galleries.getPhotos&api_key=f9736f4d370f9c7115a952951b506569&gallery_id=66911286-72157647277042064&format=json&nojsoncallback=1',
    )
    .then(response => response.json())
    .then(data =>
      // get an array of image-url
      data.photos.photo.map(photo => {
        return getFlickrImageURL(photo, 'q');
      }),
    );
  return;
};

const App = () => {
  return (
    <SafeAreaView>
      <View>{getImageURL()}</View>
    </SafeAreaView>
  );
};

export default App;
