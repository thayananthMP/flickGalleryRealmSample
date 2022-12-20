import React, {Component} from 'react';
import {
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  View,
  FlatList,
} from 'react-native';
import axios from 'axios';
import Realm, {Object} from 'realm';

let taskName;
let realm;

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const TaskSchema = {
  name: 'Task',
  properties: {
    // _id: 'int',
    name: 'string',
    status: 'string?',
  },
  // primaryKey: '_id',
};

addToRealm = value => {
  (async () => {
    try {
      realm = await Realm.open({
        schema: [TaskSchema],
        deleteRealmIfMigrationNeeded: true,
      });
      this.setState({realmObject: realm});

      await realm.write(() => {
        taskName = realm.create('Task', {
          name: value,
          status: 'Open',
        });
      });
    } catch (e) {
      console.log('error', e.message);
    }
  })();
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      realmObject: Object,
      imageName: '',
      imageURLs: [],
      imageTitle: [],
      ImageBackupItems: [],
    };
  }

  componentDidMount() {
    //For our first load.
    this.getImageURL();
  }

  getRealmValues() {
    console.log('inside method', this.state.realmObject);
    // const tasks = this.state.realmObject.objects('Task');
    // console.log(`The lists of tasks are: ${tasks.map(task => task.name)}`);
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

  onRefresh() {
    this.state.refreshing = true;
    console.log('images in array', this.state.imageURLs);
    this.state.imageURLs = [];
    this.getRealmValues();
    console.log('images in array', this.state.imageURLs);
    wait(2000).then(() => {
      this.state.refreshing = false;
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
            data={this.state.imageURLs}
            // extraData={}
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
