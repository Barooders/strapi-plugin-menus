import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Box, Stack, Typography } from '@strapi/design-system';
import { Tab, Tabs, TabPanel, TabPanels } from '@strapi/design-system/Tabs';

import { FormLayout, Section } from '../';
import { useMenuData } from '../../hooks';
import {
  camelToTitle,
  getTrad,
  menuItemProps,
  serializeFields,
} from '../../utils';

import { StyledTabGroup } from './styled';
import { add } from 'lodash';

const EditMenuItem = ( { data, fields } ) => {
  const [scopedFields, setScopedFields] = useState(fields)

  const { formatMessage } = useIntl();
  const { errors, modifiedData } = useMenuData();

  const itemIndex = modifiedData.items.findIndex( item => item.id === data.id );
  const hasItemError = !! ( errors?.items && errors.items[ itemIndex ] );

  const hasTabError = key => {
    if ( ! hasItemError ) {
      return false;
    }

    const errorFieldKeys = Object.keys( errors.items[ itemIndex ] );
    const tabFieldKeys = fields[ key ].map( field => field?.input?.name );
    const hasError = errorFieldKeys.some( name => tabFieldKeys.includes( name ) );

    return hasError;
  };

  if ( ! itemIndex && itemIndex !== 0 ) {
    return null;
  }

  useEffect(() => {
    const clonedFields = JSON.parse(
      JSON.stringify(fields)
    )


    /**
     * Get item nesting level (root = 1).
     * @param {Record<string, unknown>[]} menuItems - All menu items flattened.
     * @param {Record<string, unknown>} menuItem - Item that is checked.
     * @param {number} nestingLevel - Base nesting level.
     * @returns {number} - The nesting level.
     */
    const getItemNestingLevel = (menuItems, menuItem, nestingLevel = 1) => {
      if (menuItem.parent === null)
        return nestingLevel

      const parentById = menuItems.filter((item) => item.id === menuItem.parent.id)[0]

      nestingLevel += 1

      return getItemNestingLevel(menuItems, parentById, nestingLevel)
    }
    /**
     * It creates an UI field for the (already populated) ID field.
     * @returns {void}
     */
    const addIDField = () => {
      const IDField = {
        input: {
          name: 'id',
          type: 'string',
          // The field is already populated and read-only
          required: false,
          intlLabel: {
            defaultMessage: 'ID',
            id: 'ID'
          },
          placeholder: {
            defaultMessage: 'ID',
            id: 'ID'
          }
        },
        grid: {
          col: 12,
          s: 12
        }
      }

      if (
        clonedFields.link
        && Array.isArray( clonedFields.link )
      )
        clonedFields.link.unshift( IDField )
    }

    /**
     * It handle whether the tab `card` (and its fields) should be displayed or not.
     * @returns {void}
     */
    const handleCardFieldsDisplay = () => {
      const { id } = data
      const { items } = modifiedData
      const itemById = items.filter((item) => item.id === id)[0]
      
      const { item_type } = itemById

      const nestingLevel = getItemNestingLevel(items, itemById)

      if (
        // Card fields should be hidden unless selected item_type is 'card'
        item_type !== 'card'
        // An item of level 4 cannot be a card
        || nestingLevel === 4
      )
        delete clonedFields.card
    }
    

    /**
     * It handle whether the field `excluded_card_ids` should be displayed or not.
     * @returns {void}
     */
    const handleExcludeCardFieldDisplay = () => {
      const { id } = data
      const { items } = modifiedData
      const itemById = items.filter((item) => item.id === id)[0]
      
      const nestingLevel = getItemNestingLevel(items, itemById)

      // Items of level 3 or 4 cannot be parent of card item
      // Hence they cannot exclude any card.
      if (
        nestingLevel === 3
        || nestingLevel === 4
      ) {
        if (clonedFields.link) {
          clonedFields.link = clonedFields.link.filter((link) => (
            link?.input?.name !== 'excluded_card_ids'
          ))
        }
      }
    }

    /**
     * It handle whether the field `is_pinned` should be displayed or not.
     * @returns {void}
     */
    const handleIsPinnedDisplay = () => {
      const { id } = data
      const { items } = modifiedData
      const itemById = items.filter((item) => item.id === id)[0]
      
      const { item_type } = itemById
      
      const nestingLevel = getItemNestingLevel(items, itemById)
        
      if (
        // `is_pinned` field should be hidden if the item type is 'card'
        item_type === 'card'
        // `is_pinned` field should be hidden if the item has no parent (item level 1)
        || nestingLevel === 1
        // `is_pinned` field should be hidden if the parent has no parent (item level 2)
        || nestingLevel === 2
      ) {
        if (clonedFields.link) {
          clonedFields.link = clonedFields.link.filter((link) => (
            link?.input?.name !== 'is_pinned'
          ))
        }
      }
    }
    
    /**
     * It takes `item_type` input field and put it at top-level right after
     * ID input.
     * @returns {void}
     */
    const prioritizeItemTypeInput = () => {
      if (clonedFields.link) {
        clonedFields.link = clonedFields.link.sort((a, b) => {
          if (a.input.name === 'id')
            return -1

          if (b.input.name === 'id')
            return 1  


          if (
            a.input.name === 'item_type'
            && b.input.name !== 'item_type'
          )
            return -1

          if (
            b.input.name === 'item_type'
            && a.input.name !== 'item_type'
          )
            return 1

          return 0
        })
      }
    }


    addIDField()

    handleCardFieldsDisplay()
    handleIsPinnedDisplay()
    handleExcludeCardFieldDisplay()

    prioritizeItemTypeInput()

    setScopedFields(clonedFields)
  }, [
    data,
    modifiedData,
    fields
  ])

  return (
    <Box
      background="neutral0"
      borderRadius="4px"
      padding={ 6 }
      shadow="filterShadow"
    >
      <Typography variant="delta">
        { formatMessage( {
          id: getTrad( 'edit.tabs.title' ),
          defaultMessage: 'Edit item',
        } ) }
      </Typography>
      <StyledTabGroup
        id="menu-item-tabs"
        variant="simple"
        label={ formatMessage( {
          id: getTrad( 'edit.tabs.title' ),
          defaultMessage: 'Edit item',
        } ) }
      >
        <Tabs variant="simple">
          { Object.keys( scopedFields ).map( ( key, i ) => (
            <Tab variant="simple" key={ i } hasError={ hasTabError( key ) }>
              { formatMessage( {
                id: getTrad( `edit.tabs.title.${key}` ),
                defaultMessage: camelToTitle( key ),
              } ) }
            </Tab>
          ) ) }
        </Tabs>
        <TabPanels style={ { position: 'relative' } }>
          { Object.keys( scopedFields ).map( ( key, i ) => {
            const itemFields = serializeFields( 'items', itemIndex, scopedFields[ key ] );

            return (
              <TabPanel key={ i }>
                <Box paddingTop={ 6 }>
                  <Stack spacing={ 6 }>
                    <FormLayout fields={ itemFields } />
                  </Stack>
                </Box>
              </TabPanel>
            );
          } ) }
        </TabPanels>
      </StyledTabGroup>
    </Box>
  );
};

EditMenuItem.propTypes = {
  data: menuItemProps.isRequired,
  scopedFields: PropTypes.object.isRequired,
};

export default EditMenuItem;
