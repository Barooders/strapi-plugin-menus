import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { Flex, Typography, Avatar } from '@strapi/design-system';
import { ChevronDown, ChevronRight, Plus, Trash, ArrowUp, ArrowDown } from '@strapi/icons';

import { getBoxProps, getTrad, menuItemProps } from '../../utils';
import { Toolbar } from '../';
import { Label, Wrapper } from './styled';

const TreeMenuItem = forwardRef( ( {
  children,
  data,
  hasErrors,
  isFirst,
  isLast,
  isActive,
  isMaxDepth,
  onAddSubmenu,
  onClick,
  onDelete,
  onMoveUp,
  onMoveDown,
}, ref ) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(true);

  let bgColor, borderColor;

  if ( hasErrors ) {
    bgColor = 'danger100';
    borderColor = 'danger600';
  }

  const boxProps = getBoxProps( {
    background: bgColor ?? 'neutral0',
    borderSize: 1,
    borderStyle: 'solid',
    borderColor: borderColor ?? 'transparent',
    paddingTop: 2,
    paddingLeft: 6,
    paddingRight: 2,
    paddingBottom: 2,
    shadow: 'filterShadow',
    transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
  } );

  const actions = [
    {
      hidden: isMaxDepth,
      icon: <Plus />,
      label: formatMessage( {
        id: getTrad( 'ui.add.menu' ),
        defaultMessage: 'Add submenu',
      } ),
      onClick: onAddSubmenu,
    },
    {
      hidden: isLast,
      icon: <ArrowDown />,
      label: formatMessage( {
        id: getTrad( 'ui.move.menuItem.down' ),
        defaultMessage: 'Move item down',
      } ),
      onClick: onMoveDown,
    },
    {
      hidden: isFirst,
      icon: <ArrowUp />,
      label: formatMessage( {
        id: getTrad( 'ui.move.menuItem.up' ),
        defaultMessage: 'Move item up',
      } ),
      onClick: onMoveUp,
    },
    {
      hidden: false,
      icon: <Trash />,
      label: formatMessage( {
        id: getTrad( 'ui.delete.menuItem' ),
        defaultMessage: 'Delete menu item',
      } ),
      onClick: onDelete,
    },
    {
      hidden: isOpen,
      icon: <ChevronRight />,
      label: 'Show children',
      onClick: () => setIsOpen(true)
    },
    {
      hidden: !isOpen,
      icon: <ChevronDown />,
      label: 'Hide children',
      onClick: () => setIsOpen(false)
    },
  ];

  return (
    <div ref={ ref }>
      <Wrapper
        { ...boxProps }
        hasErrors={ hasErrors }
        isActive={ isActive }
        onClick={ onClick }
      >
          <Flex justifyContent="space-between">
            <Label>
              <Flex>
                {data.card_image?.url && (
                  <Avatar src={data.card_image?.url} />
                )}
                { data.item_type === 'card' && (
                  <span
                    style={{
                      paddingRight: '0.5rem',
                      paddingLeft: '0.5rem',
                      fontWeight: 500
                    }}
                  >(card)&nbsp;</span>
                )}
                { !! data.title ? data.title : (
                  <Typography textColor="neutral400" style={ { fontStyle: 'italic' } }>
                    { formatMessage( {
                      id: getTrad( 'ui.untitled' ),
                      defaultMessage: 'Untitled',
                    } ) }
                  </Typography>
                ) }
              </Flex>
            </Label>
          { isActive && <Toolbar actions={ actions } /> }
        </Flex>
      </Wrapper>
      { isOpen && children }
    </div>
  );
} );

TreeMenuItem.defaultProps = {
  hasErrors: false,
  isActive: false,
  isFirst: false,
  isLast: false,
  isMaxDepth: false,
  onAddSubmenu: () => {},
  onClick: () => {},
  onDelete: () => {},
  onMoveUp: () => {},
  onMoveDown: () => {},
};

TreeMenuItem.propTypes = {
  children: PropTypes.node,
  data: menuItemProps.isRequired,
  hasErrors: PropTypes.bool,
  isActive: PropTypes.bool,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  isMaxDepth: PropTypes.bool,
  onAddSubmenu: PropTypes.func,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
};

export default TreeMenuItem;
