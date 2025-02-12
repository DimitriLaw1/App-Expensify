import React, {Component} from 'react';
import {
    SafeAreaView,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {
    propTypes as validateLinkPropTypes,
    defaultProps as validateLinkDefaultProps,
} from './validateLinkPropTypes';
import styles from '../styles/styles';
import * as Session from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import SignInPageLayout from './signin/SignInPageLayout';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import NewPasswordForm from './settings/NewPasswordForm';
import FormAlertWithSubmitButton from '../components/FormAlertWithSubmitButton';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Whether a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,

        /** The password used to log in the user */
        password: PropTypes.string,
    }),

    /** Session object */
    session: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,
    }),

    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    credentials: {},
    route: validateLinkDefaultProps,
    session: {
        error: '',
        authToken: '',
    },
};

class SetPasswordPage extends Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            password: '',
            isFormValid: false,
        };
    }

    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        if (this.props.credentials.authToken) {
            return;
        }
        Session.validateEmail(accountID, validateCode);
    }

    validateAndSubmitForm() {
        if (!this.state.isFormValid) {
            return;
        }
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');

        if (this.props.credentials.authToken) {
            Session.changePasswordAndSignIn(this.props.credentials.authToken, this.state.password);
        } else {
            Session.setPassword(this.state.password, validateCode, accountID);
        }
    }

    render() {
        const buttonText = !this.props.account.validated ? this.props.translate('setPasswordPage.validatingAccount') : this.props.translate('setPasswordPage.setPassword');
        const sessionError = this.props.session.error && this.props.translate(this.props.session.error);
        const error = sessionError || this.props.account.error;
        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout
                    shouldShowWelcomeText
                    welcomeText={this.props.translate('setPasswordPage.passwordFormTitle')}
                >
                    <View style={[styles.mb4]}>
                        {/* The prop onSubmitEditing is required, but it needs to stay as a no-op because the form is submitted and validated from the button below */}
                        <NewPasswordForm
                            onSubmitEditing={() => {}}
                            password={this.state.password}
                            updatePassword={password => this.setState({password})}
                            updateIsFormValid={isValid => this.setState({isFormValid: isValid})}
                        />
                    </View>
                    <View>
                        <FormAlertWithSubmitButton
                            buttonText={buttonText}
                            isLoading={this.props.account.isLoading}
                            onSubmit={this.validateAndSubmitForm}
                            containerStyles={[styles.mb2, styles.mh0]}
                            message={error}
                            isAlertVisible={!_.isEmpty(error)}
                            isDisabled={!this.state.isFormValid}
                        />
                    </View>
                </SignInPageLayout>
            </SafeAreaView>
        );
    }
}

SetPasswordPage.propTypes = propTypes;
SetPasswordPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
        session: {
            key: ONYXKEYS.SESSION,
            initWithStoredValues: false,
        },
    }),
)(SetPasswordPage);
