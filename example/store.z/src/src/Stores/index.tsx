import React from 'react'
import { Link } from 'wouter'
import { Store, useStoreContext, ProvideStoreContext } from './Context'

const StoreItem = ({ id, name, logo, description }: Store) => {
    return (
        <div className='store'>
            <h3 className='name'>{ name }</h3>
            <div className='storelogo' style={{ backgroundImage: `url(${ logo })`, backgroundRepeat: 'no-repeat' }}></div>
            <i className="description">{ description }</i>
            <p><Link href={ `/products/${ id }` }>View { name } Products</Link></p>
            <hr />
        </div>
    )
}

const StoreList = () => {
    const { storeList } = useStoreContext()

    if (!storeList.length) {
        return <p>Loading...</p>
    }

    return <>{ storeList.map(item => <StoreItem key={ item.id } {...item}/>) }</>
}

export const Stores = () => {
    return (
        <ProvideStoreContext>
            <StoreList/>
            <p><b>Store notifications will appear below</b></p>
            <section id="notifications"></section>
        </ProvideStoreContext>
    )
}