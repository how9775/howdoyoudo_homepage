"use client";

import { CustomOverlayMap, Map, MapMarker } from "react-kakao-maps-sdk";
import useKakaoLoader from "./useKakaoLoader";
import Image from "next/image";

interface KakaoMapProps {
    lat: number;
    lng: number;
    markerTitle?: string;
}

const KakaoMap = ({ lat, lng, markerTitle }: KakaoMapProps) => {
    useKakaoLoader();
    return (
        <Map
            id="map"
            center={{ lat, lng }}
            style={{ width: "100%", height: "100%" }} // 부모 박스 안에서 꽉 차게
            level={3}
            isPanto={true}
        >
            <CustomOverlayMap
                position={{
                    lat,
                    lng,
                }}
                yAnchor={1}
            >
                <div
                    style={{
                        background: 'linear-gradient(100deg, #0c0c0c 0%, #616161 100%)',
                        color: 'white',
                        padding: '4px 24px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        position: 'relative',
                        whiteSpace: 'nowrap',
                        border: '2px solid white',
                    }}
                >
                    <div
                        style={{
                            width: 80,
                            height: 24,
                            backgroundImage: 'url("/images/logo/how_logo.png")',
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            filter: 'invert(1)',
                            marginTop: '4px',
                            marginLeft: '2px',
                        }}
                    />

                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '0',
                            height: '0',
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: '8px solid #0c0c0c',
                        }}
                    />
                </div>
            </CustomOverlayMap>
        </Map>
    );
};

export default KakaoMap;