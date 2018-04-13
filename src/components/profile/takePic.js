import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { RNCamera } from 'react-native-camera'
import { MainMenu, Button, Card, Header, ModalView } from '../common'
import AuthActions from '../../actions/auth'

const { updateUser } = AuthActions;

class TakePic extends Component {

    state = {
        cameraSide: RNCamera.Constants.Type.front
    };

    switchCamera = () => {
        if(this.state.cameraSide === RNCamera.Constants.Type.front) {
            this.setState({ cameraSide: RNCamera.Constants.Type.back});
        } else {
            this.setState({ cameraSide: RNCamera.Constants.Type.front});
        }
    };

    capture = async () => {
        if (this.camera) {
            const options = { quality: 0.3, base64: true };
            try {
                const data = await this.camera.takePictureAsync(options)
                const newUser = {...this.props.user, pic: data.base64}
                this.props.updateUser(newUser);
                Actions.pop();
                Actions.refresh({image: data.base64})
            } catch (error) {
                console.log(error);
                //Actions.pop();
            }
            
        }
    };

    goBack = () => {
        Actions.pop();
    };

    onCameraMountError = e => {
        console.log('Error mounting camera', e);
    };


    render() {
        return(
            <View style={this.style.miniModal}>
            <View style={{ height: 350, width: 240, backgroundColor: '#fff', elevation: 3 }}>
            <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style = {{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}
            type={this.state.cameraSide}
            flashMode={RNCamera.Constants.FlashMode.auto}
            ratio = '4:3'
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
            onMountError={this.onCameraMountError}
            />
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
            <TouchableOpacity onPress={this.switchCamera}>
            <Text style={{ fontFamily: 'fa-solid', fontSize: 30, alignSelf: 'center'}}>&#xf079;</Text>
            </TouchableOpacity>
            </View>
            <View style={{flex: 2, justifyContent: 'center'}}>
            <TouchableOpacity onPress={this.capture.bind(this)}>
            <View style={{ height: 50, width: 50, borderRadius: 25, backgroundColor: '#fff',
            alignSelf: 'center', justifyContent: 'center'}}> 
            <Text style={{ fontFamily: 'fa-solid', fontSize: 30, alignSelf: 'center', color: '#39759b'}}>&#xf030;</Text>           
            </View>
            </TouchableOpacity>
            </View>            
            <View style={{ flex: 1, justifyContent: 'center' }}>
            <TouchableOpacity onPress={this.goBack}>
            <Text style={{ fontFamily: 'fa-solid', fontSize: 25, alignSelf: 'center'}}>&#xf410;</Text>
            </TouchableOpacity>
            </View>
            </View>
            </View>
            </View>
        );
    }

    style = {
        miniModal: {
            flex: 1,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(51,143,194,0.6)'
        }
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});
  
export default connect(mapStateToProps, { updateUser })(TakePic);

