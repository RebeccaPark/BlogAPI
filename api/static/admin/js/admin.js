import createBrowserHistory from 'history/createBrowserHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { Router } from 'react-router';
import * as ReactRouterDOM from 'react-router-dom';
import { syncHistoryWithStore, routerReducer, push } from 'react-router-redux'

import store from './store';

const { Link } = ReactRouterDOM;

const history = syncHistoryWithStore(createBrowserHistory(), store)

class Route_ extends React.Component {
  componentWillMount() {
    if (!this.props.authentication.loggedIn) {
      if (window.location.pathname !== '/admin/login') {
        this.props.dispatch(push('/admin/login'));
      } else {
        const cookie = document.cookie;
        const parsed_cookie = cookie.split("=");
        // TODO: find exact cookie, there can be many
        if (parsed_cookie[1] !== "None") {
          this.props.dispatch('LOGIN');
          this.props.dispatch(push('/admin'));
        }
      }
    }
  }

  render() {
    return <ReactRouterDOM.Route {...this.props} />;
  }
}

const Route = connect(Route_, ({ authentication }) => ({ authentication }));

function onChange({ target: { name, value } }) {
  this.setState({ [name]: value });
}

function request(method, url, body, callback) {
  const request = new XMLHttpRequest();
  request.open(method, url, true);
  request.setRequestHeader('Content-Type', 'application/json');

  request.onreadystatechange = function () {
    const response = request.responseText;
    if (request.readyState === XMLHttpRequest.DONE) {
      if (callback) {
        callback(response ? JSON.parse(response) : undefined);
      }
    }
    return response;
  };
  request.send(body ? JSON.stringify(body) : undefined);
}

function getOnePost(post_id, callback) {
  request('GET', `http://localhost:5000/posts/${post_id}`, null,
                  callback);
}

class Table extends React.Component {
  renderHeaderColumn(column) {
    return (
      <div className={`${column.size ? `col-sm-${column.size} col-md-${column.size}` : `col`}`} key={column.name}>
        <div className="Table-cell">{column.name}</div>
      </div>
    );
  }

  render() {
    return (
      <div className="Table">
        {!this.props.header ? null : (
          <div className="Table-header">
            <div className="row">
              {this.props.header.map(this.renderHeaderColumn)}
            </div>
          </div>
        )}
        {this.props.children}
      </div>
    )
  }
}

class TableRow extends React.Component {
  render() {
    return (
      <div className="Table-row">
        <div className="row">
          {this.props.children}
        </div>
      </div>
    );
  }}

class TableCell extends React.Component {
  render() {
    const { size } = this.props;

    return (
      <div className={`${size ? `col-sm-${size} col-md-${size} col-lg-${size}` : 'col'}`}>
        <div className="Table-cell">
          {this.props.children}
        </div>
      </div>
    );
  }
}

class Login_ extends React.Component {
  constructor() {
    super();

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = onChange.bind(this);
    this.state = {};
  }

  onSubmit(e) {
    e.preventDefault();
    request('POST', 'http://localhost:5000/admin/login', {
      username: this.state.username,
      password: this.state.password,
    }, (response) => {
      if (response['errors'].length > 0) {
        this.props.dispatch(push('/admin/login'));
      } else {
        this.props.dispatch(push('/admin'));
      }
    })
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <form className="form--login"
            onSubmit={this.onSubmit}>
            <h5 className="form--login__title">BlogAPI</h5>
            <div className="l-form__row">
              <label>Username</label>
              <input
                name="username"
                type="text"
                onChange={this.onChange}
              />
            </div>
            <div className="l-form__row">
              <label>Password</label>
              <input
                type="password"
                name="password"
                onChange={this.onChange}
              />
            </div>
            <button className="btn btn-secondary button button--orange">Login to BlogAPI</button>
          </form>
        </div>
      </div>
    )
  }
}

const Login = connect(Login_)

class Posts extends React.Component {
  render() {
    const { posts, getOnePost } = this.props;
    const table_rows = [];

    for (let i=0; i < (posts || []).length; i++) {
      //table_rows == null ? table_rows = [] : null;
      table_rows.push(
        <TableRow>
          <TableCell size={1}><input type="checkbox"/></TableCell>
          <TableCell size={5}>
            <Link to={`/admin/post/${posts[i].id}/edit`}>
              {posts[i].title}
            </Link>
          </TableCell>
          <TableCell size={3}>{posts[i].created}</TableCell>
          <TableCell size={2}>{posts[i].author_id}</TableCell>
        </TableRow>
      );
    }
    
    return(
      <div className="l-content">
        <h5 className="Table-title">Posts</h5>
        <Table header={[{name: 'Select', size: 1},
                        {name: 'Title', size: 5}, 
                        {name: 'Published Date', size: 3},
                        {name: 'Published By', size: 3}]} >
            {table_rows}
        </Table>
      </div>
    )
  }
}

class Users extends React.Component {
  render() {
    const { users } = this.props
    const user_rows = [];

    for (let i=0; i < (users || []).length; i++ ) {
      console.log(users);
      user_rows.push(
        <TableRow>
          <TableCell size={2}><input type="checkbox" /></TableCell>
          <TableCell size={3}>{users[i].username}</TableCell>
          <TableCell size={2}>7</TableCell>
          <TableCell size={4}>{users[i].user_level}</TableCell>
        </TableRow>
      )
    }
    
    return(
      <div className="l-content">
        <h5 className="Table-title">Users</h5>
        <Table header={[{name: 'Select', size: 2}, {name: 'Username', size: 3}, {name: '#Published', size: 2}, {name: 'Permission level', size: 5}]}>
          {user_rows}
        </Table>
      </div>
    )
  }
}

class Admin extends React.Component {
  constructor() {
    super();

    this.state = {
      posts : null,
    }
  }
  
  componentWillMount() {
    this.getPosts();
    this.getUsers();
  }

  getPosts() {
    console.log('I am in get posts')
    request('GET', 'http://localhost:5000/posts', null, (response) => {
      this.setState({ posts: response });
          
    });   
  }

  getUsers() {
    console.log('I am in getUsers')
    request('GET', 'http://localhost:5000/users', null, (response) => {
      this.setState({ users: response });
    });
  }

  render() {
    const { posts, users } = this.state;
    
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-12 Page-title">
            <h3 className="float-left">Admin</h3>
            <Link className="btn btn-secondary float-right button button--orange" to="/admin/addPost"><span className="fa fa-plus"></span> Add Post</Link>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-7">
            <Posts getOnePost={this.getOnePost} posts={posts}/>
          </div>
          <div className="col-lg-5">
            <Users users={users}/>
          </div>
        </div>
      </div>
    )
  }
};

class AddPost_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      content: '',
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = onChange.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    const {title, content} = this.state;
    request('POST', '/posts', {
      title: title,
      content: content,
    }, () => {
      this.props.dispatch(push('/admin'));
    });
  }
  
  render() {
    const { title, content } = this.state;

    return (
      <div className="container">
        <div className="row">
        <h3 className="col-lg-12 Page-title">Create Post</h3>
        </div>
        <div className="row">
          <div className="col-lg-12">
          <form onSubmit={this.onSubmit} className="add-post l-content">
            <div className="l-form__row">
              <label>Title</label>
              <input
                name="title"
                value={title}
                onChange={this.onChange}
              />
            </div>
            <div className="l-form__row">
              <label>Content</label>
              <textarea
                name="content"
                value={content}
                onChange={this.onChange}>
              </textarea>
            </div>
            <button className="btn btn-secondary button button--orange">Publish Post</button>
          </form>
          </div>
        </div>
      </div>
    )
  }
}

const AddPost = connect(AddPost_);

class EditPost_ extends React.Component {
  constructor() {
    super();

    this.state = { title: '', content: '' };

    this.onChange = onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillMount() {
    getOnePost(id, (response) => {
      this.setState(response);
    });
  }

  onSubmit(post_id) {
    return () => {
      request('PUT', `/posts/${post_id}`, {
        'title': this.state.input_title,
        'content': this.state.input_content,
      }, () => {
        this.props.dispatch(push('/admin'));
      });
    };
  }
  
  render() {
    const { title, content } = this.state;
    return(
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <form onSubmit={this.onSubmit(this.props.match.params.postId)} className="l-content content">
              <div className="l-form__row">
                <label>Title</label>
                <input value={title} onChange={this.onChange} name="title" />
              </div>
              <div className="l-form__row">
                <label>Content</label>
                <textarea value={content} onChange={this.onChange} name="content"></textarea>
              </div>
              <button className="btn btn-secondary button button--orange">Update Post</button>
          </form>
          </div>
        </div>
      </div>
    )
  }
}

const EditPost = connnect(EditPost_);

class App_ extends React.Component {
  render() {
    return (
      <div>
        <div className="header">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                BlogAPI
                <div className="header__item">Home</div>
                <div className="header__item">About</div>
                <div className="header__item">Articles</div>
                {!this.props.authentication.loggedIn ? null : (
                   <a className="header__logout" href="/admin/logout">Logout</a> 
                )}
              </div>
            </div>
          </div>
        </div>
        <Route exact path="/admin/login" component={Login} />
        <Route exact path="/admin" component={Admin} />
        <Route path="/admin/addPost" component={AddPost} />
        <Route path="/admin/post/:postId/edit" component={EditPost} />
      </div>
    );
  }
}

const App = connect(App_, ({ authentication }) => ({ authentication }));

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App/>
    </Router>
  </Provider>,
  document.getElementById('root')
);
