import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { Icon } from '@bit/bit.evangelist.elements.icon';

import { mutedText } from '@bit/bit.base-ui.text.muted-text';

import { VersionTag } from '../../workspace-components/version-tag';
import { TimeAgo } from '../../workspace-components/time-ago';
import { Status } from '../../workspace-components/status';
import { MiddleDot } from '../../workspace-components/middle-dot';
import Avatar from '../../workspace-components/Avatar';
import { Version } from '../../workspace-page/change-log.data';
import styles from './version-block.module.scss';
import { Title } from '../../workspace-components/title';
import { CommitDetails } from '../../workspace-components/commit-details';

export type VersionBlockProps = {
  /**
   * component that gets the data of a single tag and displays it in the change log page
   */
  version: Version;
} & HTMLAttributes<HTMLDivElement>;
/**
 * change log section
 * @name VersionBlock
 */
export function VersionBlock({ version, className, ...rest }: VersionBlockProps) {
  return (
    <div className={classNames(styles.versionBlock, className)} {...rest}>
      <div className={styles.topRow}>
        <Title className={styles.marginRight}>{version.id}</Title>
        <VersionTag className={styles.marginRight}>Latest</VersionTag>
        <TimeAgo className={styles.marginRight} date={version.time} />
        <MiddleDot className={classNames(mutedText, styles.marginRight)} />
        <Status className={styles.marginRight} status={version.ciStatus} />
        <MiddleDot className={classNames(mutedText, styles.marginRight)} />
        <Status className={styles.marginRight} status={version.testStatus} />
        <Avatar
          className={styles.marginRight}
          account={version.contributors}
          size={30}
          // name={version.contributors.name}
          // alt=""
        />
        <Icon of="arrow_right" />
      </div>
      <CommitDetails commitTitle="Minor changes" commitMessage={version.message} />
    </div>
  );
}
