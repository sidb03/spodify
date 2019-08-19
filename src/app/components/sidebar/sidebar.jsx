import React, { Component, PureComponent } from 'react';

import { Layout, Menu } from 'antd';
const { Sider } = Layout;

import './sidebar.css';
import 'antd/dist/antd.css'; 

import dealerBadge from '../../../images/sidebarIcons/dealer-badge.svg';
import exam from '../../../images/sidebarIcons/exam.svg';
import icon from '../../../images/sidebarIcons/icon.svg';
import musicPlayer from '../../../images/sidebarIcons/music-player.svg';
import shoppingCart from '../../../images/sidebarIcons/shopping-cart.svg';

import { templateContainer } from '../../containers/TemplateContainer';

// class SidebarItem extends Component {

//     render() {
//         const { icon, name, value } = this.props;
//         return (
//             <Menu.Item key="1" onClick={() => this.renderTemplate({name})}>
//                 <p className="sidebar-icon">
//                     <img src={icon} alt="my music" />
//                 </p>
//                 <p className="sidebar-item">
//                     <span>{value}</span>
//                 </p>
//                 <span className="gradient"></span>
//                 <p className="clear"></p>
//             </Menu.Item>
//         );
//     }
// }

class Sidebar extends PureComponent {

    state = {
        collapsed: false
    };

    renderTemplate = templatename => {
        console.log("template", templatename);
        templateContainer.changeTemplate(templatename);
    };

    onCollapse = collapsed => {
        console.log("collapsed", collapsed);
        this.setState({ collapsed });
    };

    // renderMenuItem = menuList => {
    //     const list = [];
    //     menuList.map((item, index) => {
    //         return list.push( <SidebarItem icon={item.icon} name={item.name} value={item.value} key={index} /> )
    //     });
    //     return ( <Sider
    //         collapsible
    //         collapsed={this.state.collapsed}
    //         onCollapse={this.onCollapse}
    //         > <Menu defaultSelectedKeys={['1']} mode="inline"> {list} </Menu> </Sider> );
    // };

    render() {
        const menuItems = [
            {
                name: 'mySongs',
                icon: musicPlayer,
                value: 'My Songs'
            },
            {
                name: 'marketplace',
                icon: shoppingCart,
                value: 'Marketplace'
            },
            {
                name: 'artistPolls',
                icon: exam,
                value: 'Artist Polls'
            },
            {
                name: 'fanTokens',
                icon: dealerBadge,
                value: 'My Fan Tokens'
            },
            {
                name: 'about',
                icon: icon,
                value: 'About'
            },
        ]
        return(
            <div className="sidebar">
                <p className="logo">
                    spodify
                </p>
                <p className="tagline">
                    A DECENTRALISED SPOTIFY
                </p>
                <div>
                    {/* { this.renderMenuItem(menuItems) } */}
                    <Sider
                        collapsible
                        collapsed={this.state.collapsed}
                        onCollapse={this.onCollapse}
                    >
                    <Menu defaultSelectedKeys={['1']} mode="inline">
                        <Menu.Item key="1" onClick={() => this.renderTemplate('mySongs')}>
                            <p className="sidebar-icon">
                                <img src={musicPlayer} alt="my music" />
                            </p>
                            <p className="sidebar-item">
                                <span>My Songs</span>
                            </p>
                            <span className="gradient"></span>
                            <p className="clear"></p>
                        </Menu.Item>

                        <Menu.Item key="2" onClick={() => this.renderTemplate('marketplace')}>
                            <p className="sidebar-icon">
                                <img src={shoppingCart} alt="market place" />
                            </p>
                            <p className="sidebar-item">
                                <span>Marketplace</span>
                            </p>
                            <span className="gradient"></span>
                            <p className="clear"></p>
                        </Menu.Item>

                        <Menu.Item key="3" onClick={() => this.renderTemplate('artistPolls')}>
                            <p className="sidebar-icon">
                                <img src={exam} alt="artist polls" />
                            </p>
                            <p className="sidebar-item">
                                <span>Artist Polls</span>
                            </p>
                            <span className="gradient"></span>
                            <p className="clear"></p>
                        </Menu.Item>

                        <Menu.Item key="4" onClick={() => this.renderTemplate('fanTokens')}>
                            <p className="sidebar-icon">
                                <img src={dealerBadge} alt="fan tokens" />
                            </p>
                            <p className="sidebar-item">
                                <span>My Fan Tokens</span>
                            </p>
                            <span className="gradient"></span>
                            <p className="clear"></p>
                        </Menu.Item>

                        <Menu.Item key="5" onClick={() => this.renderTemplate('about')}>
                            <p className="sidebar-icon">
                                <img src={icon} alt="about" />
                            </p>
                            <p className="sidebar-item">
                                <span>About</span>
                            </p>
                            <span className="gradient"></span>
                            <p className="clear"></p>
                        </Menu.Item>
                    </Menu>
                </Sider>
                </div>
            </div>
        );
    };
}

export default Sidebar;