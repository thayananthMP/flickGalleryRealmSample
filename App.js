import React, {Component} from 'react';
import {
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
  Text,
  View,
  FlatList,
} from 'react-native';
import axios from 'axios';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {imageURLs: [], imageTitle: []};
  }

  componentDidMount() {
    //For our first load.
    this.getImageURL();
  }

  getImageURL() {
    axios
      .get(
        'https://www.flickr.com/services/rest/?method=flickr.galleries.getPhotos&api_key=f9736f4d370f9c7115a952951b506569&gallery_id=66911286-72157647277042064&format=json&nojsoncallback=1',
      )
      .then(data =>
        // get an array of image-url
        data.data.photos.photo.map(photo => {
          return this.getFlickrImageURL(photo);
        }),
      )
      .catch(error => console.log(error));
    return;
  }
  getFlickrImageURL(photo) {
    let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}`;
    url += '.jpg';
    this.setState({imageURLs: [...this.state.imageURLs, url]});
    this.setState({imageTitle: [...this.state.imageTitle, photo.title]});
    return url;
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <FlatList
            style={styles.flatListStyle}
            data={this.state.imageURLs}
            numColumns={2}
            renderItem={({item}) => {
              return (
                <View>
                  <Image style={styles.image} source={{uri: item}} />
                </View>
              );
            }}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  image: {
    width: Dimensions.get('window').width / 2 - 20,
    height: 150,
    margin: 10,
  },
  flatListStyle: {flex: 1},
});
