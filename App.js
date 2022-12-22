import React, {Component} from 'react';
import {
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
  Text,
  RefreshControl,
  View,
  FlatList,
} from 'react-native';
import axios from 'axios';
import Realm from 'realm';

let data = [];
let realm;

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

// Realm Schema
const TaskSchema = {
  name: 'Task',
  properties: {
    name: 'string',
    url: 'string',
    status: 'string?',
  },
};

// Add values to Realm database
addToRealm = (url, title) => {
  (async () => {
    try {
      realm = await Realm.open({
        schema: [TaskSchema],
        deleteRealmIfMigrationNeeded: true,
      });

      // Inserting values into Realm database
      realm.write(() => {
        taskName = realm.create('Task', {
          name: title,
          url: url,
          status: 'Open',
        });
      });
    } catch (e) {
      console.log('Error', e.message);
    }
  })();
};

// Fetch values from Realm database
getRealmValues = () => {
  (async () => {
    try {
      realm = await Realm.open({
        schema: [TaskSchema],
        deleteRealmIfMigrationNeeded: true,
      });

      // Getting values from Realm object
      const tasks = realm.objects('Task');
      tasks.map(task => (data = [...data, task]));
    } catch (e) {
      console.log('Error', e.message);
    }
  })();
};

// Image rendering element
function Item({item}) {
  return (
    <View>
      <Image style={styles.image} source={{uri: item.url}} />
      <Text style={{width: 170, textAlign: 'center', justifyContent: 'center'}}>
        {item.name}
      </Text>
    </View>
  );
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      images: [],
    };
  }

  componentDidMount() {
    //On first load.
    this.getImageURL();
  }

  //Fetching image-url from Flickr API
  getImageURL() {
    axios
      .get(
        'https://www.flickr.com/services/rest/?method=flickr.galleries.getPhotos&api_key=f9736f4d370f9c7115a952951b506569&gallery_id=66911286-72157647277042064&format=json&nojsoncallback=1',
      )
      .then(data =>
        // Get an array of image-url
        data.data.photos.photo.map(photo => {
          return this.getFlickrImageURL(photo);
        }),
      )
      .catch(error => console.log(error));
    return;
  }

  //Modifying  image-url
  getFlickrImageURL(photo) {
    let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}`;
    url += '.jpg';

    //Add to Realm database
    addToRealm(url, photo.title);

    this.setState({
      images: [...this.state.images, {url: url, name: photo.title}],
    });
    return url;
  }

  onRefresh() {
    this.setState({images: []});
    // Getting values from Realm database
    getRealmValues();
    this.setState({refreshing: true});
    wait(1000).then(() => {
      this.setState({refreshing: false});
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <FlatList
            refreshControl={
              <RefreshControl
                colors={['#171417']}
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh.bind(this)}
              />
            }
            style={styles.flatListStyle}
            data={this.state.images.length > 0 ? this.state.images : data}
            numColumns={2}
            renderItem={({item}) => <Item item={item} />}
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
