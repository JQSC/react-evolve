import React, { useState, createContext, useReducer, useEffect, useContext } from 'react';
import { message, Spin } from 'antd';
import { defaultChinaData, defaultChinaTotal } from '../config/default.js'
import api, { crawlerUrl } from '../config/host.js'
import $ from 'jquery'

const FormContext = createContext([{}, () => { }]);

const useForm = () => useContext(FormContext);

function formReducer(state, action) {

    switch (action.type) {
        case 'update':
            return Object.assign({}, state, {
                ...state,
                ...action.value
            });
        default:
            break;

    }
    return state
}

const initialState = {
    provinceData: null,
    description: null,
    total: null,
    bulletinData: null,
    publishTime: null,
    updateTimeMs: null
}

export const ProvideChinaForm = ({ children, pageType }) => {

    //undefined 在props中默认为true
    const [form, dispatch] = useReducer(formReducer, initialState)

    const [loading, setLoading] = useState(true)

    const setFormToServer = () => {
        setLoading(true)
        const { provinceData, description, total } = form;
        const data = {
            publishData:{
                provinceData, description, total
            }
            
        }
        const url = api + '/api/map/saveChinaMapData';
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: url,
                contentType: 'application/json;charset=UTF-8',
                processData: false,
                data: JSON.stringify(data),
                success: (res) => {
                    setLoading(false)
                    if (res.status == 200) {
                        resolve(res)
                    } else {
                        reject('Error')
                    }
                },
                error: (error) => {
                    setLoading(false)
                    message.error('Error')
                    reject(error)
                }
            })
        })
    };

    const updateForm = payload => dispatch({
        type: 'update',
        value: payload
    });

    //用抓取的数据覆盖发布的数据
    const syncForm = () => {
        const data = form.provinceData.map((item) => {
            const { scrapedConfirmedCases, scrapedDeaths, scrapedRecoveredCases } = item
            return {
                ...item,
                confirmedCases: scrapedConfirmedCases,
                deaths: scrapedDeaths,
                recoveredCases: scrapedRecoveredCases
            }
        })
        updateForm({
            provinceData: data
        })
    }

    useEffect(
        () => {
            //上次提交中国的数据 -- old
            const getPublishOld = (resolve, reject) => {
                const url = api + '/api/map/getInfo';
                $.ajax({
                    type: "GET",
                    url: url,
                    success: (res) => {
                        resolve(res.data)
                    },
                    error: (error) => {
                        reject('Error')
                    }
                })
            }
            //上次提交中国的数据
            const getPublish = new Promise((resolve, reject) => {
                const url = api + '/api/map/getChinaMapData';
                $.ajax({
                    type: "GET",
                    url: url,
                    success: (res) => {
                        if (res.data) {
                            resolve(res.data)
                        } else {
                            getPublishOld(resolve, reject)
                        }
                    },
                    error: (error) => {
                        reject('Error')
                    }
                })
            })

            //疫情实时数据
            const getExternalData = new Promise((resolve, reject) => {
                const url2 = crawlerUrl + '/feiyan/tencent/china_map.json';
                $.ajax({
                    type: "GET",
                    url: url2,
                    success: (str) => {
                        if (typeof str == 'string') {
                            try {
                                resolve(JSON.parse(str));
                            } catch (eeror) {
                                reject('Error')
                            }
                        }
                    },
                    error: (error) => {
                        reject('Error')
                    }
                })
            })


            //获取公告及其更新状态和时间
            const getBulletinData = new Promise((resolve, reject) => {
                const url = api + '/api/map/getBulletin';
                $.ajax({
                    type: "GET",
                    url: url,
                    success: (res) => {
                        resolve(res.data);
                    },
                    error: (error) => {
                        reject('Error')
                    }
                })
            })

            Promise.all([getPublish, getExternalData, getBulletinData]).then((result) => {
                //publish处理
                const [PublishedData, ScrapedData, bulletinData] = result;
                const { covData, publishTime } = PublishedData || {};
                const { provinceData: pubProvinceData, description: pubDescription, total: pubVersionTotal } = covData || {};
                const { provinceData: lastestProvinceData, description: lastestDescription, updateTimeMs } = ScrapedData || {}
                //合并lastest、lastestVersion   ==>  provinceData
                const provinceData = defaultChinaData.map((defaultItem) => {
                    let pubProvinceItem = pubProvinceData ? pubProvinceData.find((item) => item.name === defaultItem.name) : {};
                    let ScrapedProvinceItem = lastestProvinceData ? lastestProvinceData.find((item) => item.name === defaultItem.name) : null;
                    //重置历史数据的名称
                    let { confirmedCases: scrapedConfirmedCases = 0, deaths: scrapedDeaths = 0, recoveredCases: scrapedRecoveredCases = 0 } = ScrapedProvinceItem || {};
                    //合并历史版本和最新数据
                    return {
                        ...defaultItem,
                        ...pubProvinceItem,
                        scrapedConfirmedCases,
                        scrapedDeaths,
                        scrapedRecoveredCases
                    }
                })
                // description
                //结构改为数据并兼容旧的对象数据结构
                let description;
                const DescriptionType = Object.prototype.toString.call(pubDescription || []);
                if (DescriptionType == '[object Array]') {
                    //新结构
                    description = pubDescription;
                } else {
                    const { dataSource, comments, explain } = pubDescription;
                    description = [{ text: dataSource }, { text: comments }, { text: explain }];
                }
                //total
                const total = defaultChinaTotal.map((defaultItem) => {
                    let LVTotalItem = pubVersionTotal ? pubVersionTotal.find((item) => item.name === defaultItem.name) : {};
                    let { confirmedCases: pubConfirmedCases = 0, suspected: pubSuspected = 0, deaths: pubDeaths = 0, recoveredCases: pubRecoveredCases = 0 } = LVTotalItem || {};
                    //重置历史数据的名称
                    let [confirmedCases, suspected, deaths, recoveredCases] = [pubConfirmedCases, pubSuspected, pubDeaths, pubRecoveredCases];
                    //合并历史版本和最新数据
                    return {
                        ...defaultItem,
                        confirmedCases,
                        suspected,
                        deaths,
                        recoveredCases,
                        pubConfirmedCases,
                        pubSuspected,
                        pubDeaths,
                        pubRecoveredCases
                    }
                })

                setLoading(false);
                updateForm({
                    provinceData,
                    description,
                    total,
                    bulletinData,
                    publishTime,
                    updateTimeMs
                })
            }).catch((error) => {
                console.log(error)
                setLoading(false);
                message.error('Error')
            })
        },
        []
    )

    return (
        <Spin spinning={loading} tip="Loading...">
            <FormContext.Provider value={[form, { setFormToServer, updateForm, syncForm }]}>
                {children}
            </FormContext.Provider>
        </Spin>

    );
};

export default useForm;
